import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { INITIAL_TASKS, TaskItem } from '@/data/app-data';

type AppStateContextValue = {
  tasks: TaskItem[];
  progressPercent: number;
  completedCount: number;
  markTaskComplete: (taskId: string) => void;
  undoTaskComplete: (taskId: string) => void;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const progressPercent = useMemo(() => Math.round((completedCount / tasks.length) * 100), [completedCount, tasks.length]);

  const markTaskComplete = (taskId: string) => {
    setTasks((previous) => previous.map((task) => (task.id === taskId ? { ...task, completed: true } : task)));
  };

  const undoTaskComplete = (taskId: string) => {
    setTasks((previous) => previous.map((task) => (task.id === taskId ? { ...task, completed: false } : task)));
  };

  return (
    <AppStateContext.Provider
      value={{
        tasks,
        progressPercent,
        completedCount,
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
