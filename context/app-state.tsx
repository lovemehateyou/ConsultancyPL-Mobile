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

type AppStateContextValue = {
  tasks: TaskItem[];
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
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const mapGoalsToTasks = (goals: UserGoal[]) => {
    const mapped: TaskItem[] = [];

    goals
      .filter((goal) => goal.status !== 'completed')
      .forEach((goal) => {
        const category = goal.Goal?.category ?? 'Task';
        const progressItems = goal.UserTaskProgresses ?? goal.UserTaskProgress ?? [];

        progressItems.forEach((progress) => {
          const task = progress.Task;
          if (!task) {
            return;
          }

          mapped.push({
            id: String(task.id),
            taskId: task.id,
            userGoalId: goal.id,
            title: task.title,
            role: category,
            description: task.description ?? '',
            assets: mapLinksToAssets(task.mapLinks ?? undefined),
            completed: Boolean(progress.isCompleted),
            stepOrder: task.stepOrder,
          });
        });
      });

    return mapped.sort((a, b) => {
      if (a.userGoalId !== b.userGoalId) {
        return a.userGoalId - b.userGoalId;
      }
      return (a.stepOrder ?? 0) - (b.stepOrder ?? 0);
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
      setTasks(mapGoalsToTasks(goals));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const markTaskComplete = async (taskId: string) => {
    const target = tasks.find((task) => task.id === taskId);
    if (!target) {
      return;
    }

    try {
      await completeGoalTask({ userGoalId: target.userGoalId, taskId: target.taskId });
      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task,
        ),
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to complete task.');
    }
  };

  const undoTaskComplete = async (taskId: string) => {
    const target = tasks.find((task) => task.id === taskId);
    if (!target) {
      return;
    }

    try {
      await undoGoalTask({ userGoalId: target.userGoalId, taskId: target.taskId });
      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId ? { ...task, completed: false } : task,
        ),
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to undo task.');
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        tasks,
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
