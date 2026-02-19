
import React from 'react';
import { Habit } from '../types';

interface HabitTrackerProps {
  habits: Habit[];
  toggleHabit: (id: string) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, toggleHabit }) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">العادات اليومية</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map(habit => {
          const doneToday = habit.lastCompleted === today;
          return (
            <div key={habit.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 dark:text-white">{habit.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-500 font-bold text-xs flex items-center gap-1">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    سلسلة لـ {habit.streak} أيام
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleHabit(habit.id)}
                disabled={doneToday}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  doneToday 
                  ? 'bg-emerald-500 text-white cursor-default' 
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {doneToday ? (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">خارطة حرارية للاستمرارية</h3>
        <div className="grid grid-cols-7 gap-2">
           {Array.from({ length: 28 }).map((_, i) => (
             <div 
              key={i} 
              className={`aspect-square rounded-sm ${i < 18 ? 'bg-emerald-200 dark:bg-emerald-900/50' : 'bg-slate-100 dark:bg-slate-700/50'}`}
             />
           ))}
        </div>
        <p className="mt-4 text-xs text-slate-400 text-center font-medium">زادت استمراريتك بنسبة ١٢٪ عن الشهر الماضي.</p>
      </div>
    </div>
  );
};

export default HabitTracker;
