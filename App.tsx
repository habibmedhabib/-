
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import HabitTracker from './components/HabitTracker';
import { useMomentumStore } from './hooks/useMomentumStore';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dash' | 'tasks' | 'habits'>('dash');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const store = useMomentumStore();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('ar-EG', options);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:w-20 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 flex md:flex-col items-center justify-around md:justify-center gap-8 py-4 z-50">
        <div className="hidden md:block mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none">م</div>
        </div>
        
        <NavItem 
          active={activeTab === 'dash'} 
          onClick={() => setActiveTab('dash')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          label="الرئيسية"
        />
        <NavItem 
          active={activeTab === 'tasks'} 
          onClick={() => setActiveTab('tasks')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
          label="المهام"
        />
        <NavItem 
          active={activeTab === 'habits'} 
          onClick={() => setActiveTab('habits')}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          label="العادات"
        />

        <div className="md:mt-auto hidden md:block">
          <button 
            onClick={toggleDarkMode}
            className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="md:mr-20 p-6 md:p-12 max-w-5xl mx-auto pb-24 md:pb-12">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'dash' ? 'الزخم (Momentum)' : activeTab === 'tasks' ? 'قائمة المهام' : 'تتبع العادات'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{getTodayDate()} • يوم مليء بالإنجاز</p>
          </div>
          <div className="md:hidden">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
               {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dash' && (
            <Dashboard 
              tasks={store.tasks} 
              energyLevel={store.energyLevel} 
              setEnergyLevel={store.setEnergyLevel} 
              executionScore={store.executionScore}
              xp={store.xp}
              level={store.level}
            />
          )}
          {activeTab === 'tasks' && (
            <TaskList 
              tasks={store.tasks} 
              addTask={store.addTask} 
              updateTask={store.updateTask}
              reorderTasks={store.reorderTasks}
              toggleTask={store.toggleTask}
              deleteTask={store.deleteTask}
            />
          )}
          {activeTab === 'habits' && (
            <HabitTracker 
              habits={store.habits} 
              toggleHabit={store.toggleHabit} 
            />
          )}
        </section>
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 p-3 rounded-2xl transition-all ${
      active 
      ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' 
      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
    }`}
  >
    {icon}
    <span className="text-[11px] md:hidden font-bold uppercase">{label}</span>
  </button>
);

export default App;
