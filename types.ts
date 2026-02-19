
export enum Category {
  Work = 'عمل',
  Personal = 'شخصي',
  Health = 'صحة',
  Learning = 'تعلم'
}

export enum EnergyLevel {
  Low = 'منخفضة',
  Medium = 'متوسطة',
  High = 'عالية'
}

export enum EisenhowerQuadrant {
  Do = 'عاجل وهام',
  Schedule = 'غير عاجل وهام',
  Delegate = 'عاجل وغير هام',
  Eliminate = 'غير عاجل وغير هام'
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: number; // 1-5
  duration: number; // minutes
  deadline: string; // ISO string
  reminder?: string; // ISO string for the notification time
  reminderSent?: boolean; // Flag to prevent multiple notifications
  completed: boolean;
  timeSlot?: string; // HH:mm format
  quadrant: EisenhowerQuadrant;
  isRecurring: boolean;
  subTasks?: SubTask[];
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompleted: string; // YYYY-MM-DD
  history: string[]; // List of completed dates
}

export interface UserStats {
  xp: number;
  level: number;
  executionScore: number;
  completionRate: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
