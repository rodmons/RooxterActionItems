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
    UserPlus,
    Pencil,
    X
} from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { STATUS_OPTIONS, DUE_BY_OPTIONS } from './constants';
import { formatDate, isTaskOverdue } from './utils/dateUtils';

export default function App() {
    const {
        tasks,
        teamMembers,
        contexts,
        stats,
        addTask,
        addTeamMember,
        deleteTeamMember,
        updateTeamMember,
        addContext,
        deleteContext,
        updateTask,
        deleteTask,
        resetData,
        loading
    } = useTasks();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [modalFilter, setModalFilter] = useState(null); // 'P1', 'P2', 'P3', 'Completed', 'Overdue'

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
                setSelectedMember(name);
                setActiveTab('team');
            }
        } else {
            setSelectedMember(memberOrNew.name);
            setActiveTab('team');
        }
    };

    const handleRenameMember = async () => {
        const member = teamMembers.find(m => m.name === selectedMember);
        if (!member) return;
        const newName = prompt("Enter new name for " + selectedMember + ":", selectedMember);
        if (newName && newName !== selectedMember) {
            await updateTeamMember(member.id, newName);
            setSelectedMember(newName);
        }
    };

    const handleDeleteMember = async () => {
        if (confirm(`Are you sure you want to delete ${selectedMember}? All their tasks will be archived.`)) {
            const member = teamMembers.find(m => m.name === selectedMember);
            if (member) {
                await deleteTeamMember(member);
                setSelectedMember(null);
                setActiveTab('dashboard');
            }
        }
    };

    // Context changes are now handled inside the ContextDropdown component

    // Filter tasks for Modals
    const getModalTasks = () => {
        let filtered = [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        switch (modalFilter) {
            case 'P1':
                filtered = tasks.filter(t => t.priority && t.priority.includes('P1') && t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived);
                break;
            case 'P2':
                filtered = tasks.filter(t => t.priority && t.priority.includes('P2') && t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived);
                break;
            case 'P3':
                filtered = tasks.filter(t => t.priority && t.priority.includes('P3') && t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived);
                break;
            case 'Completed':
                filtered = tasks.filter(t => {
                    if (t.status !== 'Done') return false;
                    const compDate = t.deletion_date || t.submitted_on || t.created_at || t.date;
                    return new Date(compDate) >= sevenDaysAgo;
                });
                break;
            case 'Overdue':
                filtered = tasks.filter(t => t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived && isTaskOverdue(t.target_deadline));
                break;
            default:
                break;
        }
        return filtered;
    };

    return (
        <div className="min-h-screen bg-black text-slate-50 p-4 md:p-8 font-sans antialiased selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto relative">

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
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'dashboard'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" /> Overview
                    </button>

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

                    <button
                        onClick={() => setActiveTab('backlog')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'backlog'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <Archive className="w-4 h-4" /> Archive
                    </button>

                    <button
                        onClick={() => setActiveTab('deleted')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${(activeTab === 'deleted')
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <Trash2 className="w-4 h-4" /> Deleted
                    </button>
                </nav>

                {/* View: Dashboard */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <StatCard label="Critical (P1)" value={stats.p1} icon={Zap} color="text-amber-400" bgColor="bg-amber-400/10" onClick={() => setModalFilter('P1')} />
                        <StatCard label="Priority 2 (P2)" value={stats.p2} icon={Calendar} color="text-orange-400" bgColor="bg-orange-400/10" onClick={() => setModalFilter('P2')} />
                        <StatCard label="Priority 3 (P3)" value={stats.p3} icon={Calendar} color="text-blue-400" bgColor="bg-blue-400/10" onClick={() => setModalFilter('P3')} />
                        <StatCard label="Completed (7d)" value={stats.completed} icon={CheckCircle2} color="text-emerald-400" bgColor="bg-emerald-400/10" onClick={() => setModalFilter('Completed')} />
                        <StatCard label="Overdue" value={stats.overdue} icon={OctagonAlert} color="text-red-500" bgColor="bg-red-500/10" onClick={() => setModalFilter('Overdue')} />

                        <div className="col-span-full glass p-8 rounded-[2.5rem] mt-4">
                            <h3 className="text-xl font-bold mb-4">Active Team Roster</h3>
                            <div className="flex flex-wrap gap-3">
                                {teamMembers.length === 0 ? (
                                    <span className="text-slate-500 italic">No team members initialized. Select "Team Member &gt; NEW" to begin.</span>
                                ) : (
                                    teamMembers.map(m => (
                                        <div key={m.id} onClick={() => handleMemberSelect(m)} className="cursor-pointer hover:bg-slate-700 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg text-sm font-mono text-blue-300 transition-colors">
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
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 px-4 gap-4">
                            <div>
                                <div className="text-blue-500 text-[10px] uppercase font-black tracking-widest mb-1">Active Sprint</div>
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-black text-white">{selectedMember}</h2>
                                    <div className="flex gap-2">
                                        <button onClick={handleRenameMember} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleDeleteMember} className="p-1.5 bg-slate-800 hover:bg-red-900/50 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => addTask(selectedMember)}
                                className="bg-blue-600 hover:bg-blue-500 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-blue-900/20 group whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add Action
                            </button>
                        </div>

                        <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/30 border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                                            <th className="px-6 py-5 font-bold">Status</th>
                                            <th className="px-6 py-5 font-bold">Action Item</th>
                                            <th className="px-6 py-5 font-bold">Context</th>
                                            <th className="px-6 py-5 font-bold">Due By</th>
                                            <th className="px-6 py-5 font-bold text-center">Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {tasks
                                            .filter(t => t.assignee === selectedMember && t.status !== 'Deleted' && t.status !== 'Done' && !t.is_archived)
                                            .map(task => (
                                                <tr key={task.id} className={`hover:bg-blue-600/[0.03] transition-colors group ${isTaskOverdue(task.target_deadline) && task.status !== 'Done' ? 'bg-red-900/10' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={task.status}
                                                            onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                                                            className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-opacity-30 bg-opacity-10 outline-none cursor-pointer transition-all ${task.status === 'Done' ? 'bg-emerald-500 text-emerald-400 border-emerald-500' :
                                                                task.status === 'Blocked' ? 'bg-red-500 text-red-400 border-red-500' :
                                                                    task.status === 'In Progress' ? 'bg-blue-500 text-blue-400 border-blue-500' :
                                                                        'bg-slate-500 text-slate-400 border-slate-500'
                                                                }`}
                                                        >
                                                            {STATUS_OPTIONS.filter(o => o.value !== 'Deleted').map(opt => <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>)}
                                                        </select>
                                                        {isTaskOverdue(task.target_deadline) && task.status !== 'Done' && (
                                                            <div className="text-[9px] text-red-500 font-bold uppercase mt-1">Overdue!</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 min-w-[250px]">
                                                        <input
                                                            value={task.action}
                                                            onChange={(e) => updateTask(task.id, 'action', e.target.value)}
                                                            className="bg-transparent border-none outline-none w-full font-bold text-sm text-slate-200 focus:text-blue-400 transition-colors placeholder:text-slate-800"
                                                            placeholder="Task description..."
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <ContextDropdown
                                                            contexts={contexts}
                                                            value={task.category || ''}
                                                            onSelect={(name) => updateTask(task.id, 'category', name)}
                                                            onAdd={addContext}
                                                            onDelete={deleteContext}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={task.due_by_type || ''}
                                                            onChange={(e) => updateTask(task.id, 'due_by_type', e.target.value)}
                                                            className="bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-slate-700 transition-colors appearance-auto"
                                                        >
                                                            {DUE_BY_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => deleteTask(task.id)}
                                                            className="text-slate-800 hover:text-red-500 transition-all transform hover:scale-125 p-2"
                                                            title="Delete (Move to Trash)"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                {tasks.filter(t => t.assignee === selectedMember && t.status !== 'Deleted' && !t.is_archived).length === 0 && (
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
                    <div className="glass p-12 rounded-[3rem] text-center border-dashed border-2 border-white/5 animate-in fade-in duration-700">
                        <Archive className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <h2 className="text-3xl font-black mb-4 tracking-tight">System Archive</h2>
                        <p className="text-slate-500 max-w-md mx-auto font-medium mb-8">
                            Completed items and tasks from deleted team members are stored here for historical reference.
                        </p>
                        <div className="text-left bg-slate-900/50 p-6 rounded-2xl max-h-96 overflow-y-auto w-full max-w-4xl mx-auto">
                            {tasks.filter(t => t.status === 'Done' || t.is_archived).map(task => (
                                <div key={task.id} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold mb-1">{task.assignee}</div>
                                        <div className="text-sm text-slate-300">{task.action}</div>
                                    </div>
                                    <div className="text-xs text-slate-600">{formatDate(task.date || task.created_at)}</div>
                                </div>
                            ))}
                            {tasks.filter(t => t.status === 'Done' || t.is_archived).length === 0 && (
                                <div className="text-slate-600 italic text-center py-4">Archive empty.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* View: Deleted / Trash */}
                {activeTab === 'deleted' && (
                    <div className="glass p-12 rounded-[3rem] text-center border-dashed border-2 border-red-900/30 animate-in fade-in duration-700">
                        <Trash2 className="w-16 h-16 text-red-900 mx-auto mb-6" />
                        <h2 className="text-3xl font-black mb-4 tracking-tight text-red-400">Deleted Items (30 Days)</h2>
                        <p className="text-slate-500 max-w-md mx-auto font-medium mb-8">
                            Soft-deleted items will be permanently removed after 30 days.
                        </p>
                        <div className="text-left bg-slate-900/50 p-6 rounded-2xl max-h-96 overflow-y-auto w-full max-w-4xl mx-auto">
                            {tasks.filter(t => t.status === 'Deleted').map(task => (
                                <div key={task.id} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold mb-1">{task.assignee}</div>
                                        <div className="text-sm text-slate-400">{task.action}</div>
                                    </div>
                                    <div className="text-xs text-slate-600">Deleted on {formatDate(task.deletion_date)}</div>
                                </div>
                            ))}
                            {tasks.filter(t => t.status === 'Deleted').length === 0 && (
                                <div className="text-slate-600 italic text-center py-4">Trash bin empty.</div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* MODAL OVERLAY */}
            {modalFilter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalFilter(null)}></div>
                    <div className="relative glass w-full max-w-4xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setModalFilter(null)}
                            className="absolute top-6 right-6 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-black mb-6 text-white tracking-widest uppercase flex items-center gap-3">
                            {modalFilter} Tasks
                            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">{getModalTasks().length}</span>
                        </h2>

                        <div className="overflow-x-auto no-scrollbar max-h-[60vh]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/30 border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-[0.2em] sticky top-0 backdrop-blur-md">
                                        <th className="px-4 py-4 font-bold">Team</th>
                                        <th className="px-4 py-4 font-bold">Action Item</th>
                                        <th className="px-4 py-4 font-bold">Due By</th>
                                        <th className="px-4 py-4 font-bold">Done</th>
                                        <th className="px-4 py-4 font-bold">Submitted On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {getModalTasks().map(task => (
                                        <tr key={task.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-bold text-blue-300">{task.assignee}</td>
                                            <td className="px-4 py-4 text-sm font-semibold text-slate-200">{task.action}</td>
                                            <td className="px-4 py-4 text-xs font-bold text-slate-400">
                                                {task.due_by_type}
                                                {isTaskOverdue(task.target_deadline) && <span className="text-red-500 ml-2">(Overdue)</span>}
                                            </td>
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={task.status === 'Done'}
                                                    onChange={(e) => updateTask(task.id, 'status', e.target.checked ? 'Done' : 'To Do')}
                                                    className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-900 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-xs font-mono text-slate-500">
                                                {formatDate(task.submitted_on || task.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                    {getModalTasks().length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-12 text-center text-slate-600 italic">No tasks found matching this filter.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

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

// --- Context Dropdown Component ---
function ContextDropdown({ contexts, value, onSelect, onAdd, onDelete }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isCreating, setIsCreating] = React.useState(false);
    const [newName, setNewName] = React.useState('');
    const ref = React.useRef(null);

    // Close on outside click
    React.useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setIsOpen(false); setIsCreating(false); setNewName(''); } };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        await onAdd(newName.trim());
        onSelect(newName.trim());
        setNewName('');
        setIsCreating(false);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setIsCreating(false); setNewName(''); }}
                className="flex items-center gap-1 text-slate-400 text-xs font-semibold hover:text-white transition-colors"
            >
                <span>{value || <span className="italic text-slate-600">Select...</span>}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {contexts.length === 0 && !isCreating && (
                        <div className="px-4 py-3 text-slate-600 italic text-xs">No contexts yet.</div>
                    )}
                    {contexts.map(c => (
                        <div key={c.id} className="flex items-center justify-between group px-4 py-2.5 hover:bg-slate-800 cursor-pointer"
                            onClick={() => { onSelect(c.name); setIsOpen(false); }}
                        >
                            <span className={`text-xs font-semibold ${value === c.name ? 'text-blue-400' : 'text-slate-300'}`}>{c.name}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all ml-2"
                                title="Delete context"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <div className="h-px bg-slate-800" />
                    {isCreating ? (
                        <div className="px-3 py-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setIsCreating(false); setNewName(''); } }}
                                placeholder="Context name..."
                                className="flex-1 bg-slate-800 border border-slate-600 text-xs text-white rounded-lg px-2 py-1.5 outline-none focus:border-blue-500"
                            />
                            <button type="button" onClick={handleAdd} className="text-xs text-blue-400 font-bold hover:text-blue-300">Add</button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-blue-400 hover:bg-blue-900/20 transition-colors"
                        >
                            + Create New
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Internal Components ---
function StatCard({ label, value, icon: Icon, color, bgColor, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`glass p-8 rounded-[2rem] border border-transparent hover:border-slate-500/30 cursor-pointer transition-all group relative overflow-hidden`}
        >
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                <Icon className="w-32 h-32" />
            </div>
            <div className="flex justify-between items-center mb-4 relative z-10">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
                <div className={`${bgColor} p-2.5 rounded-2xl`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
            <div className="text-5xl font-black tracking-tighter relative z-10">{value}</div>
        </div>
    );
}
