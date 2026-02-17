import React, { useState, useEffect } from 'react';
import {
  Plus,
  RotateCcw,
  LayoutDashboard,
  Users,
  Archive,
  Trash2,
  Zap,
  Calendar,
  OctagonAlert,
  CheckCircle2,
  Activity,
  BarChart3,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { STATUS_OPTIONS, CATEGORY_OPTIONS } from './constants';

export default function App() {
  const { tasks, teamMembers, stats, addTask, addTeamMember, updateTask, deleteTask, resetData, loading } = useTasks();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState(null); // The currently viewed team member (object or string name)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-slate-50 flex flex-col items-center justify-center font-sans">
        <Activity className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <div className="animate-pulse text-blue-400 font-bold tracking-[0.3em] text-sm">INITIALIZING ROOXTER CORE...</div>
      </div>
    );
  }

  const handleMemberSelect = async (memberOrNew) => {
    setIsDropdownOpen(false);
    if (memberOrNew === 'NEW') {
      const name = prompt("Enter new Team Member name:");
      if (name) {
        await addTeamMember(name);
        setSelectedMember(name); // Select the new name immediately
        setActiveTab('team');
      }
    } else {
      setSelectedMember(memberOrNew.name);
      setActiveTab('team');
    }
  };

  // Filter tasks for the active view
  const activeTasks = activeTab === 'team' && selectedMember
    ? tasks.filter(t => t.assignee === selectedMember && t.status !== 'Done') // 'Done' can act as archive or keep them? User said "Active Sprint", usually implies not done or recent. Let's show all non-archived for now, or just all. User didn't specify filter. Let's show ALL for that person.
    : [];

  return (
    <div className="min-h-screen bg-black text-slate-50 p-4 md:p-8 font-sans antialiased selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">System Active</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
              ROOXTER ACTION ITEMS
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2">Team workflow and production control center.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetData}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-3 rounded-2xl transition-all group"
              title="Refresh Data"
            >
              <RotateCcw className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:rotate-[-45deg] transition-all" />
            </button>
          </div>
        </header>

        {/* Global Navigation */}
        <nav className="flex flex-wrap gap-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-1.5 rounded-2xl w-fit mb-10 relative z-20">
          {/* Dashboard Button */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>

          {/* Team Member Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'team'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              <Users className="w-4 h-4" />
              {selectedMember ? selectedMember : "Team Member"}
              <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
                {teamMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleMemberSelect(member)}
                    className="px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    {member.name}
                  </button>
                ))}
                <div className="h-px bg-slate-800 my-1"></div>
                <button
                  onClick={() => handleMemberSelect('NEW')}
                  className="px-4 py-3 text-left text-sm font-bold text-blue-400 hover:bg-blue-900/30 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> CREATE NEW
                </button>
              </div>
            )}
          </div>

          {/* Archive Button */}
          <button
            onClick={() => setActiveTab('backlog')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'backlog'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
          >
            <Archive className="w-4 h-4" /> Archive
          </button>
        </nav>

        {/* View: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <StatCard label="Due Today" value={stats.dueToday} icon={Calendar} color="text-blue-400" bgColor="bg-blue-400/10" />
            <StatCard label="Critical (P1)" value={stats.p1} icon={Zap} color="text-amber-400" bgColor="bg-amber-400/10" />
            <StatCard label="Blocked" value={stats.blocked} icon={OctagonAlert} color="text-red-400" bgColor="bg-red-400/10" />
            <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="text-emerald-400" bgColor="bg-emerald-400/10" />

            <div className="lg:col-span-4 glass p-8 rounded-[2.5rem] mt-4">
              <h3 className="text-xl font-bold mb-4">Active Team Roster</h3>
              <div className="flex flex-wrap gap-3">
                {teamMembers.length === 0 ? (
                  <span className="text-slate-500 italic">No team members initialized. Select "Team Member > NEW" to begin.</span>
                ) : (
                  teamMembers.map(m => (
                    <div key={m.id} className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg text-sm font-mono text-blue-300">
                      {m.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* View: Team Member (Active Sprint) */}
        {activeTab === 'team' && selectedMember && (
          <div className="animate-in fade-in zoom-in-95 duration-500">

            {/* Context Header for Team Member */}
            <div className="flex justify-between items-end mb-6 px-4">
              <div>
                <div className="text-blue-500 text-[10px] uppercase font-black tracking-widest mb-1">Active Sprint</div>
                <h2 className="text-3xl font-black text-white">{selectedMember}</h2>
              </div>
              <button
                onClick={() => addTask(selectedMember)}
                className="bg-blue-600 hover:bg-blue-500 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-900/20 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add Action
              </button>
            </div>

            <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/30 border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                      <th className="px-8 py-6 font-bold">Status</th>
                      <th className="px-8 py-6 font-bold">Action Item</th>
                      <th className="px-8 py-6 font-bold">Context</th>
                      <th className="px-8 py-6 font-bold text-center">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tasks
                      .filter(t => t.assignee === selectedMember)
                      .map(task => (
                        <tr key={task.id} className="hover:bg-blue-600/[0.03] transition-colors group">
                          <td className="px-8 py-6">
                            <select
                              value={task.status}
                              onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                              className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border border-opacity-30 bg-opacity-10 outline-none cursor-pointer transition-all ${task.status === 'Done' ? 'bg-emerald-500 text-emerald-400 border-emerald-500' :
                                task.status === 'Blocked' ? 'bg-red-500 text-red-400 border-red-500' :
                                  task.status === 'In Progress' ? 'bg-blue-500 text-blue-400 border-blue-500' :
                                    'bg-slate-500 text-slate-400 border-slate-500'
                                }`}
                            >
                              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                            </select>
                          </td>
                          <td className="px-8 py-6 min-w-[350px]">
                            <input
                              value={task.action}
                              onChange={(e) => updateTask(task.id, 'action', e.target.value)}
                              className="bg-transparent border-none outline-none w-full font-bold text-lg text-slate-200 focus:text-blue-400 transition-colors placeholder:text-slate-800"
                              placeholder="Task description..."
                            />
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <select
                                value={task.category}
                                onChange={(e) => updateTask(task.id, 'category', e.target.value)}
                                className="bg-transparent text-slate-400 text-sm font-semibold outline-none cursor-pointer hover:text-white transition-colors"
                              >
                                {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                              </select>
                              <span className="text-[10px] text-slate-600 uppercase font-bold mt-1 tracking-widest">{task.priority}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-slate-800 hover:text-red-500 transition-all transform hover:scale-125 p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {tasks.filter(t => t.assignee === selectedMember).length === 0 && (
                  <div className="p-20 text-center text-slate-600 font-bold italic tracking-tighter text-2xl">
                    SYSTEM CLEAR. NO ACTIVE ITEMS FOR {selectedMember?.toUpperCase()}.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View: Archive / Backlog */}
        {activeTab === 'backlog' && (
          <div className="glass p-20 rounded-[3rem] text-center border-dashed border-2 border-white/5 animate-in fade-in duration-700">
            <Archive className="w-16 h-16 text-slate-800 mx-auto mb-6" />
            <h2 className="text-3xl font-black mb-4 tracking-tight">System Archive</h2>
            <p className="text-slate-500 max-w-md mx-auto font-medium">
              Completed items are stored here for historical reference.
            </p>
          </div>
        )}

      </div>

      {/* Styles Injection */}
      <style>{`
        .glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// --- Internal Components ---
function StatCard({ label, value, icon: Icon, color, bgColor }) {
  return (
    <div className="glass p-10 rounded-[2.5rem] hover:border-blue-500/40 transition-all group relative overflow-hidden">
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:rotate-12`}>
        <Icon className="w-32 h-32" />
      </div>
      <div className="flex justify-between items-center mb-6 relative z-10">
        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        <div className={`${bgColor} p-3 rounded-2xl`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <div className="text-6xl font-black tracking-tighter relative z-10">{value}</div>
    </div>
  );
}
