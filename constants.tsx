
import React from 'react';
import { Category, EisenhowerQuadrant, Task, Habit } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.Work]: 'bg-blue-500',
  [Category.Personal]: 'bg-purple-500',
  [Category.Health]: 'bg-emerald-500',
  [Category.Learning]: 'bg-amber-500',
};

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'مراجعة مقترح المشروع الجديد',
    category: Category.Work,
    priority: 5,
    duration: 60,
    deadline: new Date().toISOString(),
    completed: false,
    quadrant: EisenhowerQuadrant.Do,
    isRecurring: false
  },
  {
    id: '2',
    title: 'الجري الصباحي اليومي',
    category: Category.Health,
    priority: 4,
    duration: 30,
    deadline: new Date().toISOString(),
    completed: true,
    quadrant: EisenhowerQuadrant.Schedule,
    isRecurring: true
  },
  {
    id: '3',
    title: 'تعلم أنماط ريأكت المتقدمة',
    category: Category.Learning,
    priority: 3,
    duration: 45,
    deadline: new Date().toISOString(),
    completed: false,
    quadrant: EisenhowerQuadrant.Schedule,
    isRecurring: false
  }
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h1',
    name: 'قراءة ٢٠ صفحة',
    streak: 5,
    lastCompleted: '2023-10-26',
    history: ['2023-10-26', '2023-10-25', '2023-10-24', '2023-10-23', '2023-10-22']
  },
  {
    id: 'h2',
    name: 'تأمل لمدة ١٠ دقائق',
    streak: 12,
    lastCompleted: '2023-10-26',
    history: []
  }
];
