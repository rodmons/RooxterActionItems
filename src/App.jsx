
import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Dashboard } from './components/dashboard/Dashboard';
import { TaskTable } from './components/tasks/TaskTable';
import { Plus, RotateCcw, Archive, LayoutDashboard, ListTodo } from 'lucide-react';
import { getTodayString } from './utils/dateUtils';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS, ENERGY_LEVELS, STATUS_OPTIONS } from './constants';

const DEFAULT_TASKS = [
  { id: 1, status: 'To Do', action: 'Draft pitch for Wunderloom', category: 'SaaS/Wunderloom', priority: 'P1 (Critical)', date: '2023-10-27', energy: 'High', created: '2023-10-20' },
  { id: 2, status: 'In Progress', action: 'Review VFX render farm queue', category: 'Rooxter Films', priority: 'P2 (High)', date: '2023-10-25', energy: 'Medium', created: '2023-10-15' },
  { id: 3, status: 'Blocked', action: 'Family photo shoot details', category: 'Family', priority: 'P3 (Normal)', date: '2023-11-05', energy: 'Low', created: '2023-10-18' },
  { id: 4, status: 'Done', action: 'Outline Podcast Episode 10', category: 'Podcast', priority: 'P2 (High)', date: '2023-10-20', energy: 'Medium', created: '2023-10-10' }
];

function App() {
  const [tasks, setTasks] = useLocalStorage('action_tasks', DEFAULT_TASKS);
  const [activeTab, setActiveTab] = useState('dashboard');

  const updateTask = (id, field, value) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      status: 'To Do',
      action: 'New action item...',
      category: CATEGORY_OPTIONS[0].value,
      priority: PRIORITY_OPTIONS[1].value, // P2
      date: getTodayString(),
      energy: ENERGY_LEVELS[1], // Medium
      created: getTodayString()
    };
    setTasks(prev => [newTask, ...prev]);
    setActiveTab('active');
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const resetData = () => {
    if (confirm("This will clear all changes and reset to defaults. Continue?")) {
      setTasks(DEFAULT_TASKS);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Master Action Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Sleek workflow management for cross-functional projects.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addTask}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" /> Add Action
          </button>
          <button
            onClick={resetData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 transition px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-900/50 rounded-2xl w-fit border border-slate-800">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <ListTodo className="w-4 h-4" /> Active Sprint
        </button>
        <button
          onClick={() => setActiveTab('backlog')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'backlog' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <Archive className="w-4 h-4" /> Backlog
        </button>
      </div>

      {/* Content */}
      <main className="animate-fade-in">
        {activeTab === 'dashboard' && <Dashboard tasks={tasks} />}

        {activeTab === 'active' && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            {/* Filter for non-backlog items if we had a backlog status, but for now showing all or Active */}
            <TaskTable
              tasks={tasks}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          </div>
        )}

        {activeTab === 'backlog' && (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <Archive className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Backlog & Future Ideas</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              This is your dumping ground for future VFX concepts or SaaS features.
              Switch back to 'Active Sprint' to manage current tasks.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
