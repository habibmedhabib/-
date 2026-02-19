
import { useState, useEffect, useCallback } from 'react';
import { Task, Habit, EnergyLevel, EisenhowerQuadrant, Category } from '../types';
import { INITIAL_TASKS, INITIAL_HABITS } from '../constants';

export function useMomentumStore() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(EnergyLevel.Medium);
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(5);

  const addTask = (title: string, priority: number, category: Category, duration: number, description?: string, deadline?: string, reminder?: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      priority,
      category,
      duration,
      description: description || '',
      deadline: deadline || new Date().toISOString(),
      reminder: reminder || undefined,
      reminderSent: false,
      completed: false,
      quadrant: priority >= 4 ? EisenhowerQuadrant.Do : EisenhowerQuadrant.Schedule,
      isRecurring: false
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        // If reminder is changed, reset reminderSent flag
        if (updates.reminder !== undefined && updates.reminder !== t.reminder) {
          updated.reminderSent = false;
        }
        // Recalculate quadrant if priority changed
        if (updates.priority !== undefined) {
          updated.quadrant = updated.priority >= 4 ? EisenhowerQuadrant.Do : EisenhowerQuadrant.Schedule;
        }
        return updated;
      }
      return t;
    }));
  };

  const reorderTasks = (startIndex: number, endIndex: number) => {
    setTasks(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = !t.completed;
        if (newStatus) setXp(curr => curr + 10 * t.priority);
        return { ...t, completed: newStatus };
      }
      return t;
    }));
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const alreadyDone = h.lastCompleted === today;
        if (!alreadyDone) {
          setXp(curr => curr + 25);
          return {
            ...h,
            streak: h.streak + 1,
            lastCompleted: today,
            history: [today, ...h.history]
          };
        }
        return h;
      }
      return h;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const executionScore = Math.round(
    (tasks.filter(t => t.completed).length / (tasks.length || 1)) * 100
  );

  // Notification Mechanism
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.completed && task.reminder && !task.reminderSent) {
          const reminderTime = new Date(task.reminder);
          if (now >= reminderTime) {
            // Trigger Notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`تذكير: ${task.title}`, {
                body: `حان وقت البدء في مهمتك: ${task.title}`,
                icon: '/favicon.ico'
              });
            }
            // Mark as sent
            updateTask(task.id, { reminderSent: true });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return {
    tasks,
    habits,
    energyLevel,
    setEnergyLevel,
    xp,
    level,
    addTask,
    updateTask,
    reorderTasks,
    toggleTask,
    deleteTask,
    toggleHabit,
    executionScore
  };
}
