import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { assignMatchingGoals, completeGoalTask, fetchMyGoals, type GoalTaskMapLink, type UserGoal, undoGoalTask } from '@/services/task';

type TaskAsset = {
  name: string;
  url: string;
};

export type TaskItem = {
  id: string;
  taskId: number;
  userGoalId: number;
  title: string;
  role: string;
  description: string;
  assets: TaskAsset[];
  completed: boolean;
  stepOrder?: number;
};

export type GoalItem = {
  id: number;
  goalId: number;
  title: string;
  category: string;
  description: string;
  status: string;
  progress: number;
  tasks: TaskItem[];
};

type AppStateContextValue = {
  goals: GoalItem[];
  tasks: TaskItem[];
  goalsCount: number;
  progressPercent: number;
  completedCount: number;
  isLoading: boolean;
  errorMessage: string | null;
  refreshTasks: () => Promise<void>;
  markTaskComplete: (taskId: string) => Promise<void>;
  undoTaskComplete: (taskId: string) => Promise<void>;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tasks = useMemo(() => goals.flatMap((goal) => goal.tasks), [goals]);
  const goalsCount = useMemo(() => goals.length, [goals]);
  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const progressPercent = useMemo(
    () => (tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0),
    [completedCount, tasks.length],
  );

  const mapLinksToAssets = (links?: GoalTaskMapLink[] | null) => {
    if (!Array.isArray(links)) {
      return [] as TaskAsset[];
    }

    return links
      .filter((link) => link && typeof link.url === 'string' && link.url.trim())
      .map((link) => ({
        name: link.subCity?.trim() || link.city?.trim() || 'Location',
        url: link.url.trim(),
      }));
  };

  const calculateProgress = (items: TaskItem[]) => {
    const completed = items.filter((task) => task.completed).length;
    const progress = items.length ? Math.round((completed / items.length) * 100) : 0;
    return { completed, progress };
  };

  const resolveGoalStatus = (progress: number, currentStatus?: string) => {
    if (progress === 100) {
      return 'completed';
    }

    if (currentStatus === 'not_started') {
      return 'not_started';
    }

    return 'in_progress';
  };

  const mapGoalsToItems = (goalList: UserGoal[]) => {
    const mapped = goalList.map((goal) => {
      const category = goal.Goal?.category ?? 'Goal';
      const progressItems = goal.UserTaskProgresses ?? goal.UserTaskProgress ?? [];

      const tasksForGoal = progressItems
        .map((progress) => {
          const task = progress.Task;
          if (!task) {
            return null;
          }

          return {
            id: String(task.id),
            taskId: task.id,
            userGoalId: goal.id,
            title: task.title,
            role: category,
            description: task.description ?? '',
            assets: mapLinksToAssets(task.mapLinks ?? undefined),
            completed: Boolean(progress.isCompleted),
            stepOrder: task.stepOrder,
          } as TaskItem;
        })
        .filter((task): task is TaskItem => Boolean(task))
        .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0));

      const { progress } = calculateProgress(tasksForGoal);

      return {
        id: goal.id,
        goalId: goal.goalId,
        title: goal.Goal?.title ?? 'Goal',
        category,
        description: goal.Goal?.description ?? '',
        status: resolveGoalStatus(progress, goal.status),
        progress,
        tasks: tasksForGoal,
      } as GoalItem;
    });

    return mapped.sort((a, b) => {
      const aCompleted = a.status === 'completed';
      const bCompleted = b.status === 'completed';
      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1;
      }
      return a.id - b.id;
    });
  };

  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let goals = await fetchMyGoals();
      if (!goals.length) {
        await assignMatchingGoals();
        goals = await fetchMyGoals();
      }
      setGoals(mapGoalsToItems(goals));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load goals.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const markTaskComplete = async (taskId: string) => {
    const targetGoal = goals.find((goal) => goal.tasks.some((task) => task.id === taskId));
    const targetTask = targetGoal?.tasks.find((task) => task.id === taskId);
    if (!targetGoal || !targetTask) {
      return;
    }

    try {
      await completeGoalTask({ userGoalId: targetTask.userGoalId, taskId: targetTask.taskId });
      setGoals((previous) =>
        previous.map((goal) => {
          if (goal.id !== targetGoal.id) {
            return goal;
          }

          const updatedTasks = goal.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: true } : task,
          );
          const { progress } = calculateProgress(updatedTasks);

          return {
            ...goal,
            tasks: updatedTasks,
            progress,
            status: resolveGoalStatus(progress, goal.status),
          };
        }),
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to complete task.');
    }
  };

  const undoTaskComplete = async (taskId: string) => {
    const targetGoal = goals.find((goal) => goal.tasks.some((task) => task.id === taskId));
    const targetTask = targetGoal?.tasks.find((task) => task.id === taskId);
    if (!targetGoal || !targetTask) {
      return;
    }

    try {
      await undoGoalTask({ userGoalId: targetTask.userGoalId, taskId: targetTask.taskId });
      setGoals((previous) =>
        previous.map((goal) => {
          if (goal.id !== targetGoal.id) {
            return goal;
          }

          const updatedTasks = goal.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: false } : task,
          );
          const { progress } = calculateProgress(updatedTasks);

          return {
            ...goal,
            tasks: updatedTasks,
            progress,
            status: resolveGoalStatus(progress, goal.status),
          };
        }),
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to undo task.');
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        goals,
        tasks,
        goalsCount,
        progressPercent,
        completedCount,
        isLoading,
        errorMessage,
        refreshTasks,
        markTaskComplete,
        undoTaskComplete,
      }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}
