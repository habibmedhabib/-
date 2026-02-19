
import React from 'react';
import { EnergyLevel, Task } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface DashboardProps {
  tasks: Task[];
  energyLevel: EnergyLevel;
  setEnergyLevel: (level: EnergyLevel) => void;
  executionScore: number;
  xp: number;
  level: number;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, energyLevel, setEnergyLevel, executionScore, xp, level 
}) => {
  const topPriorities = tasks
    .filter(t => !t.completed)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  const nextXp = (level + 1) * 500;
  const progressToNextLevel = ((xp % 500) / 500) * 100;

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">درجة التنفيذ</h3>
            <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded text-xs font-bold">{executionScore}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-500" 
              style={{ width: `${executionScore}%` }}
            />
          </div>
          <p className="mt-4 text-xs text-slate-400 font-medium">الهدف: 85% للأداء العالي</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">مستوى الزخم</h3>
            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded text-xs font-bold">المستوى {level}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
          <p className="mt-4 text-xs text-slate-400 font-medium">{xp} خبرة • متبقي {nextXp - (xp % 500)} للمستوى التالي</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">الطاقة اليومية</h3>
          <div className="flex gap-2">
            {[EnergyLevel.Low, EnergyLevel.Medium, EnergyLevel.High].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEnergyLevel(lvl)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  energyLevel === lvl 
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' 
                    : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-slate-100 dark:bg-slate-700/50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400 font-medium">تم الضبط على سعة {energyLevel}</p>
        </div>
      </div>

      {/* Top Priorities Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">تركيز اليوم</h2>
        <div className="space-y-3">
          {topPriorities.length > 0 ? topPriorities.map((task) => (
            <div key={task.id} className="flex items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl group transition-all hover:shadow-md">
              <div className={`w-1.5 h-10 rounded-full ml-4 ${CATEGORY_COLORS[task.category]}`} />
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</h4>
                <div className="flex items-center text-xs text-slate-500 gap-3 mt-1">
                  <span>{task.category}</span>
                  <span>•</span>
                  <span>{task.duration} دقيقة</span>
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-600 dark:bg-red-900/20 rounded font-bold uppercase">أولوية {task.priority}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center text-slate-400">
              <p>لا توجد مهام عالية الأولوية حالياً. عمل رائع!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
