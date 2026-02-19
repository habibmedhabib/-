
import React, { useState } from 'react';
import { Category, Task, SubTask } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { breakdownTask } from '../services/geminiService';

interface TaskListProps {
  tasks: Task[];
  addTask: (title: string, priority: number, category: Category, duration: number, description?: string, deadline?: string, reminder?: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, addTask, updateTask, reorderTasks, toggleTask, deleteTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState(new Date().toISOString().slice(0, 16));
  const [newReminder, setNewReminder] = useState('');
  const [newCategory, setNewCategory] = useState<Category>(Category.Work);
  const [newPriority, setNewPriority] = useState(3);
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Edit State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editReminder, setEditReminder] = useState('');
  const [editCategory, setEditCategory] = useState<Category>(Category.Work);
  const [editPriority, setEditPriority] = useState(3);

  // Preview State (store ID to keep it synced with store updates)
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);
  const previewTask = tasks.find(t => t.id === previewTaskId);

  // Delete Confirmation State
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(
      newTitle, 
      newPriority, 
      newCategory, 
      30, 
      newDescription, 
      new Date(newDeadline).toISOString(),
      newReminder ? new Date(newReminder).toISOString() : undefined
    );
    setNewTitle('');
    setNewDescription('');
    setNewReminder('');
    setNewDeadline(new Date().toISOString().slice(0, 16));
    setIsAdding(false);
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDeadline(new Date(task.deadline).toISOString().slice(0, 16));
    setEditReminder(task.reminder ? new Date(task.reminder).toISOString().slice(0, 16) : '');
    setEditCategory(task.category);
    setEditPriority(task.priority);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editingTaskId) return;
    updateTask(editingTaskId, {
      title: editTitle,
      description: editDescription,
      deadline: new Date(editDeadline).toISOString(),
      reminder: editReminder ? new Date(editReminder).toISOString() : undefined,
      category: editCategory,
      priority: editPriority
    });
    setEditingTaskId(null);
  };

  const handleAIDecompose = async (task: Task) => {
    setLoadingAI(task.id);
    const steps = await breakdownTask(task.title);
    const subTasks: SubTask[] = steps.map((step: string) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: step,
      completed: false
    }));
    
    updateTask(task.id, { subTasks });
    setLoadingAI(null);
    setPreviewTaskId(task.id); // Open preview to show breakdown
  };

  const toggleSubTask = (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subTasks) return;

    const updatedSubTasks = task.subTasks.map(st => 
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );

    updateTask(taskId, { subTasks: updatedSubTasks });
  };

  const onDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const onDrop = (index: number) => {
    if (draggedItemIndex !== null && draggedItemIndex !== index) {
      reorderTasks(draggedItemIndex, index);
    }
    setDraggedItemIndex(null);
    setDragOverIndex(null);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateProgress = (task: Task) => {
    if (!task.subTasks || task.subTasks.length === 0) {
      return task.completed ? 100 : 0;
    }
    const completedCount = task.subTasks.filter(st => st.completed).length;
    return Math.round((completedCount / task.subTasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">المهام النشطة</h2>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingTaskId(null); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          {isAdding ? 'إلغاء' : '+ مهمة جديدة'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">عنوان المهمة</label>
              <input 
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="ما الذي تريد إنجازه؟"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">وصف المهمة (اختياري)</label>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 dark:text-white h-24 resize-none"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="أضف المزيد من التفاصيل هنا..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">الفئة</label>
              <select 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 dark:text-white font-medium"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Category)}
              >
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">الأولوية (١-٥)</label>
              <input 
                type="number" min="1" max="5"
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 dark:text-white font-medium"
                value={newPriority}
                onChange={(e) => setNewPriority(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">الموعد النهائي</label>
              <input 
                type="datetime-local"
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 dark:text-white font-medium"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">تذكير (اختياري)</label>
              <input 
                type="datetime-local"
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 dark:text-white font-medium"
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors">إضافة المهمة</button>
        </form>
      )}

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div 
            key={task.id}
            draggable={editingTaskId !== task.id}
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={() => onDrop(index)}
            onDragEnd={() => { setDraggedItemIndex(null); setDragOverIndex(null); }}
            className={`flex flex-col p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border group transition-all duration-200 ${
              editingTaskId !== task.id ? 'cursor-move' : ''
            } ${
              draggedItemIndex === index ? 'opacity-30 scale-95' : 'opacity-100'
            } ${
              dragOverIndex === index ? 'border-indigo-400 border-dashed bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-700'
            } ${task.completed ? 'opacity-50' : ''}`}
          >
            {editingTaskId === task.id ? (
              <form onSubmit={handleUpdate} className="space-y-4 w-full animate-in fade-in duration-200">
                <input 
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500 dark:text-white font-bold"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 dark:text-white h-20 resize-none"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="الوصف..."
                />
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg p-2 text-xs dark:text-white font-medium"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Category)}
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input 
                    type="number" min="1" max="5"
                    className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg p-2 text-xs dark:text-white font-medium"
                    value={editPriority}
                    onChange={(e) => setEditPriority(parseInt(e.target.value))}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">الموعد</label>
                    <input 
                      type="datetime-local"
                      className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg p-2 text-xs dark:text-white font-medium"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">التذكير</label>
                    <input 
                      type="datetime-local"
                      className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg p-2 text-xs dark:text-white font-medium"
                      value={editReminder}
                      onChange={(e) => setEditReminder(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg shadow-sm font-bold text-xs">حفظ التغييرات</button>
                  <button 
                    type="button"
                    onClick={() => setEditingTaskId(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg shadow-sm font-bold text-xs"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center w-full">
                {/* Drag Handle Icon */}
                <div className="text-slate-300 dark:text-slate-600 ml-2 group-hover:text-indigo-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400'}`}
                >
                  {task.completed && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1 mr-4">
                  <span className={`block font-medium dark:text-slate-200 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold text-white ${CATEGORY_COLORS[task.category]}`}>
                      {task.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">أولوية {task.priority}</span>
                    {task.reminder && !task.completed && (
                      <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-900/30 px-1 rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        منبه
                      </span>
                    )}
                    {task.subTasks && task.subTasks.length > 0 && (
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">
                        {task.subTasks.filter(st => st.completed).length}/{task.subTasks.length} خطوات
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewTaskId(task.id); }}
                    className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="معاينة المهمة"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                    className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="تعديل المهمة"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                   {!task.completed && (
                     <button 
                      onClick={(e) => { e.stopPropagation(); handleAIDecompose(task); }}
                      disabled={loadingAI === task.id}
                      className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="تقسيم ذكي للذكاء الاصطناعي"
                    >
                      {loadingAI === task.id ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </button>
                   )}
                   <button 
                    onClick={(e) => { e.stopPropagation(); setTaskToDelete(task); }}
                    className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="حذف المهمة"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">هل أنت متأكد؟</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                سيتم حذف المهمة <span className="font-bold text-slate-700 dark:text-slate-200">"{taskToDelete.title}"</span> نهائياً. لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-[0.98] hover:bg-red-700"
                >
                  حذف المهمة
                </button>
                <button 
                  onClick={() => setTaskToDelete(null)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-2xl font-black transition-all hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
            {/* Header Color Bar */}
            <div className={`h-2 w-full ${CATEGORY_COLORS[previewTask.category]}`} />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{previewTask.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold text-white ${CATEGORY_COLORS[previewTask.category]}`}>
                      {previewTask.category}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-bold">
                      أولوية {previewTask.priority}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewTaskId(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Visual Progress Indicator */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase">التقدم المحرز</h4>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{calculateProgress(previewTask)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${CATEGORY_COLORS[previewTask.category]}`}
                    style={{ width: `${calculateProgress(previewTask)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Sub-tasks Section */}
                {previewTask.subTasks && previewTask.subTasks.length > 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      خطوات التنفيذ
                    </h4>
                    <div className="space-y-3">
                      {previewTask.subTasks.map(st => (
                        <div 
                          key={st.id} 
                          onClick={() => toggleSubTask(previewTask.id, st.id)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            st.completed 
                            ? 'bg-indigo-500 border-indigo-500' 
                            : 'border-slate-300 group-hover:border-indigo-400'
                          }`}>
                            {st.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm font-medium ${st.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center py-8">
                     <button 
                       onClick={() => handleAIDecompose(previewTask)}
                       disabled={loadingAI === previewTask.id}
                       className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                     >
                       {loadingAI === previewTask.id ? 'جاري التحليل...' : (
                         <>
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                           </svg>
                           إنشاء خطوات تنفيذ ذكية بالذكاء الاصطناعي
                         </>
                       )}
                     </button>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                  <h4 className="text-xs font-black text-slate-400 uppercase mb-2">الوصف</h4>
                  {previewTask.description ? (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{previewTask.description}</p>
                  ) : (
                    <p className="text-slate-400 dark:text-slate-600 italic text-sm">لا يوجد وصف متاح لهذه المهمة.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-1">المدة</h4>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{previewTask.duration} دقيقة</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <h4 className="text-xs font-black text-slate-400 uppercase mb-1">الموعد</h4>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{formatDate(previewTask.deadline)}</p>
                  </div>
                  {previewTask.reminder && (
                    <div className="col-span-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                      <h4 className="text-xs font-black text-amber-500 uppercase mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        التذكير مجدول في
                      </h4>
                      <p className="font-bold text-amber-700 dark:text-amber-300 text-sm">{formatDate(previewTask.reminder)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => { toggleTask(previewTask.id); setPreviewTaskId(null); }}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-[0.98] ${
                    previewTask.completed 
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300' 
                    : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                  }`}
                >
                  {previewTask.completed ? 'إلغاء الإكمال' : 'تحديد كمكتمل'}
                </button>
                <button 
                  onClick={() => setPreviewTaskId(null)}
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-2xl font-black transition-all hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
