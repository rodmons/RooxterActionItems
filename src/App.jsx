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
    X,
    Coffee,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Globe
} from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { STATUS_OPTIONS, DUE_BY_OPTIONS } from './constants';
import { formatDate, isTaskOverdue } from './utils/dateUtils';

export default function App() {
    const {
        tasks,
        teamMembers,
        categories,
        stats,
        addTask,
        addTeamMember,
        deleteTeamMember,
        updateTeamMember,
        addCategory,
        deleteCategory,
        updateTask,
        deleteTask,
        permanentlyDeleteTask,
        resetData,
        loading
    } = useTasks();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [modalFilter, setModalFilter] = useState(null); // 'P1', 'P2', 'P3', 'Completed', 'Overdue', 'Backburner'
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
    const [showAllTasksBoard, setShowAllTasksBoard] = useState(false);
    const [allTasksCategoryFilter, setAllTasksCategoryFilter] = useState('All');

    // Calendar Tasks Logic
    const calendarDays = React.useMemo(() => {
        // Filter out completed, deleted, archived, backburner, and missing target_deadline
        let calendarTasks = tasks.filter(t =>
            t.status !== 'Done' &&
            t.status !== 'Deleted' &&
            !t.is_archived &&
            t.priority !== 'Backburner' &&
            t.target_deadline
        );

        // Sort by assignee (ascending), then urgency
        const weightMap = { '1 hr': 1, '6 hrs': 2, 'Today': 3, '3 days': 4, 'This Week': 5, 'This Month': 6 };
        calendarTasks.sort((a, b) => {
            if (a.assignee < b.assignee) return -1;
            if (a.assignee > b.assignee) return 1;
            const weightA = weightMap[a.due_by_type] || 99;
            const weightB = weightMap[b.due_by_type] || 99;
            return weightA - weightB;
        });

        // Group by local date string
        const grouped = {};
        calendarTasks.forEach(t => {
            const dateStr = new Date(t.target_deadline).toLocaleDateString('en-US'); // MM/DD/YYYY format
            if (!grouped[dateStr]) grouped[dateStr] = [];
            grouped[dateStr].push(t);
        });
        return grouped;
    }, [tasks]);

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

    // Category changes are now handled inside the CategoryDropdown component

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
            case 'Backburner':
                filtered = tasks.filter(t => t.priority === 'Backburner' && t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived);
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
            case 'Archive':
                filtered = tasks.filter(t => t.status === 'Done' || t.is_archived);
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
                        <h1 className="flex items-baseline gap-1 text-6xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
                            taskker.io
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

                {/* Global Navigation - Adjusted for Mobile Stability */}
                <nav className="flex flex-wrap items-center gap-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-1.5 rounded-2xl w-full md:w-fit mb-10 relative z-30">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'dashboard'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" /> Overview
                    </button>

                    <div className="relative flex-1 md:flex-none">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'team'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            <span className="truncate max-w-[100px] md:max-w-none">
                                {selectedMember ? selectedMember : "Team Member"}
                            </span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full min-w-[224px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
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
                        onClick={() => setActiveTab('calendar')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'calendar'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <CalendarDays className="w-4 h-4" /> Calendar
                    </button>

                    {/* View: Deleted / Trash (Temporarily Hidden)
                    <button
                        onClick={() => setActiveTab('deleted')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${(activeTab === 'deleted')
                            ? 'bg-red-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <Trash2 className="w-4 h-4" /> Deleted
                    </button>
                    */}
                </nav>

                {/* View: Calendar */}
                {activeTab === 'calendar' && (
                    <div className="glass p-8 rounded-[3rem] animate-in fade-in duration-700">
                        <div className="flex items-center gap-4 mb-8">
                            <CalendarDays className="w-8 h-8 text-blue-400" />
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setCurrentMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                                    className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-8 h-8 text-blue-500" />
                                </button>
                                <h2 className="text-3xl font-black tracking-tight uppercase min-w-[180px] text-center">
                                    {currentMonthDate.toLocaleString('default', { month: 'short' })} {currentMonthDate.getFullYear()}
                                </h2>
                                <button
                                    onClick={() => setCurrentMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                                    className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-8 h-8 text-blue-500" />
                                </button>
                            </div>
                        </div>

                        {/* Month Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-black uppercase text-slate-500 py-2 border-b border-slate-700">
                                    {day}
                                </div>
                            ))}

                            {/* Generate current month cells */}
                            {(() => {
                                const firstDay = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
                                const offset = firstDay.getDay();
                                const daysInMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate();
                                const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

                                return Array.from({ length: totalCells }).map((_, i) => {
                                    const dateCount = i - offset + 1;
                                    const isCurrentMonth = dateCount > 0 && dateCount <= daysInMonth;

                                    if (!isCurrentMonth) {
                                        return <div key={i} className="h-40 p-2 border border-transparent rounded-xl flex flex-col bg-transparent"></div>;
                                    }

                                    const cellDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), dateCount);
                                    const dateStr = cellDate.toLocaleDateString('en-US');
                                    const dayTasks = calendarDays[dateStr] ? calendarDays[dateStr] : [];

                                    const isToday = cellDate.toDateString() === new Date().toDateString();

                                    return (
                                        <div key={i} className="h-40 p-2 border border-slate-800/50 rounded-xl flex flex-col bg-slate-900/30">
                                            <div className="flex justify-start mb-2 shrink-0">
                                                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-blue-400/20 border border-blue-500 text-blue-400' : 'text-slate-400'}`}>
                                                    {dateCount}
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                                                {dayTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        className={`text-[10px] p-1.5 rounded border bg-slate-800/80 transition-all hover:scale-[1.02] cursor-default
                                                            ${task.priority?.includes('P1') ? 'border-amber-500/50 text-amber-200' :
                                                                task.priority?.includes('P2') ? 'border-orange-500/50 text-orange-200' :
                                                                    'border-blue-500/50 text-blue-200'}`}
                                                    >
                                                        <div className="font-black truncate">{task.assignee}</div>
                                                        <div className="truncate opacity-80">{task.action}</div>
                                                        <div className="text-[8px] uppercase mt-0.5 opacity-60 font-mono tracking-wider">{task.due_by_type}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {/* View: Dashboard */}
                {activeTab === 'dashboard' && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex w-full gap-2 md:gap-4 overflow-hidden">
                            <StatCard label="Critical (P1)" value={stats.p1} icon={Zap} color="text-red-500" bgColor="bg-red-500/10" valueColor="text-slate-400" onClick={() => setModalFilter('P1')} />
                            <StatCard label="Priority 2 (P2)" value={stats.p2} icon={Calendar} color="text-orange-500" bgColor="bg-orange-500/10" valueColor="text-slate-400" onClick={() => setModalFilter('P2')} />
                            <StatCard label="Priority 3 (P3)" value={stats.p3} icon={Calendar} color="text-yellow-500" bgColor="bg-yellow-500/10" valueColor="text-slate-400" onClick={() => setModalFilter('P3')} />
                            <StatCard label="Backburner" value={stats.backburner} icon={Coffee} color="text-slate-400" bgColor="bg-slate-400/10" onClick={() => setModalFilter('Backburner')} />
                            <StatCard label="COMPLETED (7d)" value={stats.completed} icon={CheckCircle2} color="text-emerald-500" bgColor="bg-emerald-500/10" onClick={() => setModalFilter('Completed')} />
                        </div>

                        {/* All Tasks Rolldown Toggle */}
                        <button
                            onClick={() => setShowAllTasksBoard(!showAllTasksBoard)}
                            className="w-full glass py-4 rounded-[2rem] flex items-center justify-center gap-3 text-slate-300 font-bold hover:bg-slate-800/80 hover:text-white transition-all group mt-2 border border-slate-700/50 hover:border-blue-500/30 shadow-lg"
                        >
                            <span className="tracking-widest uppercase text-sm">
                                {showAllTasksBoard ? '- Hide All Tasks' : '+ View All Tasks'}
                            </span>
                        </button>

                        {/* All Tasks Rolldown Board */}
                        {showAllTasksBoard && (
                            <div className="glass p-8 rounded-[2.5rem] mt-2 animate-in slide-in-from-top-4 fade-in duration-500 border border-slate-700/50 shadow-2xl">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/5 pb-6">
                                    <div>
                                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Production Board</h2>
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest hidden md:inline-block">Filter Category:</span>
                                        <select
                                            value={allTasksCategoryFilter}
                                            onChange={(e) => setAllTasksCategoryFilter(e.target.value)}
                                            className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-slate-700 transition-colors w-full md:w-auto shadow-inner"
                                        >
                                            <option value="All">All Categories</option>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <AllTasksBoard tasks={tasks} categoryFilter={allTasksCategoryFilter} updateTask={updateTask} categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} />
                            </div>
                        )}

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

                        <div className="glass rounded-[2.5rem] border border-white/5 min-h-[450px]">
                            <div className="overflow-visible no-scrollbar">
                                {/* Desktop Table */}
                                <div className="hidden md:block">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900/30 border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-[0.2em]">
                                                <th className="px-6 py-5 font-bold">Status</th>
                                                <th className="px-6 py-5 font-bold">Action Item</th>
                                                <th className="px-6 py-5 font-bold">Category</th>
                                                <th className="px-6 py-5 font-bold">Due By</th>
                                                <th className="px-6 py-5 font-bold text-center">Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {tasks
                                                .filter(t => t.assignee === selectedMember && t.status !== 'Deleted' && t.status !== 'Done' && !t.is_archived)
                                                .map(task => (
                                                    <TaskRow
                                                        key={task.id}
                                                        task={task}
                                                        updateTask={updateTask}
                                                        categories={categories}
                                                        addCategory={addCategory}
                                                        deleteCategory={deleteCategory}
                                                        deleteTask={deleteTask}
                                                        showAssignee={false}
                                                    />
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden flex flex-col gap-4 p-4">
                                    {tasks
                                        .filter(t => t.assignee === selectedMember && t.status !== 'Deleted' && t.status !== 'Done' && !t.is_archived)
                                        .map(task => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                updateTask={updateTask}
                                                categories={categories}
                                                addCategory={addCategory}
                                                deleteCategory={deleteCategory}
                                                deleteTask={deleteTask}
                                                showAssignee={false}
                                            />
                                        ))}
                                </div>
                                {tasks.filter(t => t.assignee === selectedMember && t.status !== 'Deleted' && t.status !== 'Done' && !t.is_archived).length === 0 && (
                                    <div className="p-20 text-center text-slate-600 font-bold italic tracking-tighter text-2xl">
                                        SYSTEM CLEAR. NO ACTIVE ITEMS FOR {selectedMember?.toUpperCase()}.
                                    </div>
                                )}
                            </div>
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
                                <div key={task.id} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0 group transition-colors hover:bg-slate-800/30 px-4 -mx-4 rounded-xl">
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold mb-1">{task.assignee}</div>
                                        <div className="text-sm text-slate-400">{task.action}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-slate-600">Deleted on {formatDate(task.deletion_date)}</div>
                                        <button
                                            onClick={() => { if (confirm("Are you sure? This will remove the item from the system forever.")) permanentlyDeleteTask(task.id); }}
                                            className="opacity-0 group-hover:opacity-100 flex items-center gap-2 text-xs font-bold uppercase text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-600"
                                            title="Permanently Delete"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete Forever
                                        </button>
                                    </div>
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

                        {/* Action Corner: Toggles and Close */}
                        <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
                            {(modalFilter === 'Completed' || modalFilter === 'Archive') && (
                                <button
                                    onClick={() => setModalFilter(modalFilter === 'Completed' ? 'Archive' : 'Completed')}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
                                >
                                    <Archive className="w-4 h-4" />
                                    {modalFilter === 'Completed' ? 'ARCHIVE' : '7 DAYS COMPLETED'}
                                </button>
                            )}
                            <button
                                onClick={() => setModalFilter(null)}
                                className="p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-black mb-6 text-white tracking-widest uppercase flex items-center gap-3">
                            {modalFilter === 'Completed' ? 'COMPLETED TASKS (7 days)' : modalFilter === 'Archive' ? 'SYSTEM ARCHIVE' : `${modalFilter} Tasks`}
                            <span className={`${modalFilter === 'Completed' ? 'bg-emerald-500' : modalFilter === 'Archive' ? 'bg-slate-600' : 'bg-blue-600'} text-white text-xs px-3 py-1 rounded-full`}>
                                {getModalTasks().length}
                            </span>
                        </h2>

                        <div className="overflow-x-auto no-scrollbar max-h-[60vh]">
                            {modalFilter === 'Archive' ? (
                                <div className="text-left w-full mx-auto pb-4">
                                    {getModalTasks().map(task => (
                                        <div key={task.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0 group transition-colors hover:bg-slate-800/30 px-4 -mx-4 rounded-xl w-full overflow-hidden">
                                            <div className="flex items-center flex-1 min-w-0 pr-8">
                                                <span className="text-slate-500 text-sm font-bold shrink-0 w-20">{task.assignee}</span>
                                                <span className="text-slate-300 text-xs font-light truncate shrink">{task.action}</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-12 shrink-0 text-slate-500 text-sm font-bold mr-4 w-[350px]">
                                                <span className="flex-1 text-right">{task.category || ' '}</span>
                                                <span className="shrink-0 w-[100px] text-right">{formatDate(task.date || task.created_at)}</span>
                                            </div>
                                            <button
                                                onClick={() => { if (confirm("Are you sure you want to PERMANENTLY delete this archived item? This cannot be undone.")) permanentlyDeleteTask(task.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all transform hover:scale-110 shrink-0"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {getModalTasks().length === 0 && (
                                        <div className="text-slate-600 italic text-center py-12">Archive empty.</div>
                                    )}
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/30 border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-[0.2em] sticky top-0 backdrop-blur-md z-10">
                                            <th className="px-4 py-4 font-bold">Team</th>
                                            <th className="px-4 py-4 font-bold">Action Item</th>
                                            <th className="px-4 py-4 font-bold">Category</th>
                                            <th className="px-4 py-4 font-bold">Due By</th>
                                            <th className="px-4 py-4 font-bold">Done</th>
                                            <th className="px-4 py-4 font-bold">Submitted On</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {getModalTasks().map(task => (
                                            <tr key={task.id} className="hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-4 py-4 text-sm font-bold text-blue-300">{task.assignee}</td>
                                                <td className={`px-4 py-4 text-sm font-semibold ${task.status === 'Done' ? 'text-slate-500' : 'text-slate-200'}`}>
                                                    {task.action}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {task.category && (
                                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-900/20 px-2 py-1 rounded-md border border-slate-500/20 truncate max-w-[120px] inline-block whitespace-nowrap">
                                                            {task.category}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-xs font-bold text-slate-400">
                                                    {task.due_by_type}
                                                    {isTaskOverdue(task.target_deadline) && task.status !== 'Done' && <span className="text-red-500 ml-2">(Overdue)</span>}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.status === 'Done'}
                                                        onChange={(e) => updateTask(task.id, 'status', e.target.checked ? 'Done' : 'To Do')}
                                                        className="w-5 h-5 rounded border-slate-600 accent-emerald-500 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-xs font-mono text-slate-500 flex justify-between items-center">
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
                            )}
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

// --- Updated Category Dropdown Component ---
function CategoryDropdown({ categories, value, onSelect, onAdd, onDelete }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isCreating, setIsCreating] = React.useState(false);
    const [newName, setNewName] = React.useState('');
    const ref = React.useRef(null);

    // Close on outside click
    React.useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
                setIsCreating(false);
                setNewName('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAdd = async () => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        await onAdd(trimmed);
        onSelect(trimmed);
        setNewName('');
        setIsCreating(false);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setIsCreating(false); setNewName(''); }}
                className="flex items-center gap-2 text-slate-400 text-xs font-bold hover:text-white transition-colors group"
            >
                <span className={`whitespace-nowrap ${value ? "text-blue-400" : "italic text-slate-600"}`}>
                    {value || "Select Category..."}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : 'opacity-50'}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2">

                    {/* List Existing Categories */}
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                        {categories.map(c => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between group/item px-4 py-2 hover:bg-blue-600 cursor-pointer transition-colors"
                                onClick={() => { onSelect(c.name); setIsOpen(false); }}
                            >
                                <span className={`text-[10px] sm:text-xs font-light tracking-wide ${value === c.name ? 'text-white' : 'text-slate-300'}`}>
                                    {c.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                                    className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-white transition-all ml-2"
                                    title="Delete category"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Separator only if there are existing categories */}
                    {categories.length > 0 && <div className="h-px bg-slate-800 my-1" />}

                    {/* Create New Logic */}
                    {isCreating ? (
                        <div className="px-3 py-2 flex items-center gap-2 bg-slate-800/50" onClick={(e) => e.stopPropagation()}>
                            <input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAdd();
                                    if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
                                }}
                                placeholder="New Category..."
                                className="flex-1 min-w-0 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1.5 outline-none focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={handleAdd}
                                className="text-[10px] bg-blue-600 text-white font-black uppercase hover:bg-blue-500 px-2 py-1 rounded-lg transition-colors shadow-lg"
                            >
                                Add
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}
                            className="w-full px-4 py-2 text-left text-[10px] font-bold text-blue-400 hover:bg-blue-900/30 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-3 h-3" /> CREATE NEW
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Due By Dropdown Component ---
function DueByDropdown({ value, priority, onSelect }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // --- Helper Functions ---
    // Helper to get only the short priority code
    const getShortPriority = (p) => {
        if (!p) return null;
        if (p.includes('P1')) return 'P1';
        if (p.includes('P2')) return 'P2';
        if (p.includes('P3')) return 'P3';
        return null;
    };

    const getPriorityColor = (p) => {
        if (!p) return 'text-slate-400';
        if (p.includes('P1')) return 'text-red-500';
        if (p.includes('P2')) return 'text-orange-500';
        if (p.includes('P3')) return 'text-yellow-500';
        return 'text-slate-400';
    };

    const shortPriority = getShortPriority(priority);
    const priorityColor = getPriorityColor(priority);

    // Map specific due dates to their priority representation for the dropdown menu
    const getOptionPriority = (opt) => {
        if (['1 hr', '6 hrs', 'Today'].includes(opt)) return { text: 'P1', color: 'text-red-500' };
        if (['3 days', 'This Week'].includes(opt)) return { text: 'P2', color: 'text-orange-500' };
        if (['This Month'].includes(opt)) return { text: 'P3', color: 'text-yellow-500' };
        return null; // Backburner or unrecognized
    };

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-lg px-2 py-1.5 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
                <span className="text-slate-300 text-xs font-bold whitespace-nowrap">
                    {value || "Due By..."}
                </span>
                {shortPriority && (
                    <span className={`text-xs font-black ${priorityColor}`}>
                        {shortPriority}
                    </span>
                )}
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : 'opacity-50'}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 cursor-pointer">
                    {DUE_BY_OPTIONS.map(opt => {
                        const optPriority = getOptionPriority(opt);
                        return (
                            <div
                                key={opt}
                                onClick={() => { onSelect(opt); setIsOpen(false); }}
                                className="flex items-center gap-2 px-4 py-3 hover:bg-slate-800 transition-colors text-left"
                            >
                                <span className={`text-sm font-semibold flex-1 ${value === opt ? 'text-white' : 'text-slate-400'}`}>
                                    {opt}
                                </span>
                                {optPriority && (
                                    <span className={`text-xs font-black ${optPriority.color}`}>
                                        {optPriority.text}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// --- Internal Components ---
function StatCard({ label, value, icon: Icon, color, bgColor, valueColor, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`flex-1 min-w-0 glass p-2 sm:p-4 md:p-6 rounded-xl md:rounded-[2rem] border border-transparent hover:border-slate-500/30 cursor-pointer transition-all group relative overflow-hidden flex flex-col justify-between`}
        >
            <div className={`absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:rotate-12 pointer-events-none`}>
                <Icon className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24" />
            </div>
            <div className="flex justify-between items-start mb-1 md:mb-4 relative z-10 w-full">
                <span className="text-slate-400 text-[6px] sm:text-[8px] md:text-[10px] font-black uppercase tracking-[0.05em] md:tracking-[0.1em] truncate block w-full pr-1 shrink leading-tight">{label}</span>
                <div className={`${bgColor} p-1 md:p-2.5 rounded-lg md:rounded-2xl shrink-0 hidden lg:block`}>
                    <Icon className={`w-3 h-3 md:w-5 md:h-5 ${color}`} />
                </div>
            </div>
            <div className={`text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter relative z-10 truncate ${valueColor || color}`}>{value}</div>
        </div>
    );
}

// --- Responsive Task Components ---
function TaskRow({ task, updateTask, categories, addCategory, deleteCategory, deleteTask, showAssignee }) {
    const textareaRef = React.useRef(null);

    React.useEffect(() => {
        if (task.action === '' && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [task.action]);

    return (
        <tr className={`hover:bg-blue-600/[0.03] transition-colors group ${isTaskOverdue(task.target_deadline) && task.status !== 'Done' ? 'bg-red-900/10' : ''}`}>
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
            </td>
            <td className="px-6 py-4 min-w-[250px] w-full max-w-sm">
                <textarea
                    ref={textareaRef}
                    value={task.action}
                    onChange={(e) => updateTask(task.id, 'action', e.target.value)}
                    className="bg-transparent border-none outline-none w-full font-bold text-sm text-slate-200 focus:text-blue-400 transition-colors placeholder:text-slate-800 resize-none overflow-hidden block"
                    placeholder="Task description..."
                    rows={1}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />
            </td>
            {showAssignee && (
                <td className="px-6 py-4 text-sm font-bold text-blue-300">
                    {task.assignee}
                </td>
            )}
            <td className="px-6 py-4 whitespace-nowrap">
                <CategoryDropdown
                    categories={categories}
                    value={task.category || ''}
                    onSelect={(name) => updateTask(task.id, 'category', name)}
                    onAdd={addCategory}
                    onDelete={deleteCategory}
                />
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <DueByDropdown
                        value={task.due_by_type || ''}
                        priority={task.priority}
                        onSelect={(val) => updateTask(task.id, 'due_by_type', val)}
                    />
                    {isTaskOverdue(task.target_deadline) && task.status !== 'Done' && (
                        <span className="text-[10px] text-red-500 font-bold uppercase whitespace-nowrap">
                            Overdue!
                        </span>
                    )}
                </div>
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
    );
}

function TaskCard({ task, updateTask, categories, addCategory, deleteCategory, deleteTask, showAssignee }) {
    const textareaRef = React.useRef(null);

    React.useEffect(() => {
        if (task.action === '' && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [task.action]);

    return (
        <div className={`bg-slate-800/40 p-4 rounded-2xl border ${isTaskOverdue(task.target_deadline) && task.status !== 'Done' ? 'border-red-900/50 bg-red-900/10' : 'border-slate-700/50'} flex flex-col gap-4 relative shadow-lg`}>
            {/* Top row: Status and Assignee */}
            <div className="flex justify-between items-start gap-2">
                <select
                    value={task.status}
                    onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                    className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border border-opacity-30 bg-opacity-10 outline-none cursor-pointer transition-all w-fit ${task.status === 'Done' ? 'bg-emerald-500 text-emerald-400 border-emerald-500' :
                        task.status === 'Blocked' ? 'bg-red-500 text-red-400 border-red-500' :
                            task.status === 'In Progress' ? 'bg-blue-500 text-blue-400 border-blue-500' :
                                'bg-slate-500 text-slate-400 border-slate-500'
                        }`}
                >
                    {STATUS_OPTIONS.filter(o => o.value !== 'Deleted').map(opt => <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>)}
                </select>

                <div className="flex items-center gap-2">
                    {showAssignee && (
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider bg-blue-900/20 px-2 py-1 rounded-md border border-blue-500/20 truncate max-w-[150px]">
                            {task.assignee}
                        </span>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Action Item Input */}
            <textarea
                ref={textareaRef}
                value={task.action}
                onChange={(e) => updateTask(task.id, 'action', e.target.value)}
                className="bg-transparent border-none outline-none w-full font-bold text-sm text-white focus:text-blue-400 transition-colors placeholder:text-slate-600 resize-none overflow-hidden block"
                placeholder="Task description..."
                rows={1}
                onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
            />

            {/* Bottom row: Category and Due By */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700/50">
                <CategoryDropdown
                    categories={categories}
                    value={task.category || ''}
                    onSelect={(name) => updateTask(task.id, 'category', name)}
                    onAdd={addCategory}
                    onDelete={deleteCategory}
                />

                <div className="flex items-center gap-2">
                    <DueByDropdown
                        value={task.due_by_type || ''}
                        priority={task.priority}
                        onSelect={(val) => updateTask(task.id, 'due_by_type', val)}
                    />
                    {isTaskOverdue(task.target_deadline) && task.status !== 'Done' && (
                        <span className="text-[9px] text-red-500 font-bold uppercase whitespace-nowrap">Overdue!</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- All Tasks Rolldown Board Component ---
function AllTasksBoard({ tasks, categoryFilter, updateTask, categories, addCategory, deleteCategory }) {
    // Helper to filter tasks by priority/status and currently selected category
    const getTasksByBucket = (bucketName) => {
        let bucketTasks = [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        switch (bucketName) {
            case 'P1':
                bucketTasks = tasks.filter(t => t.priority && t.priority.includes('P1') && t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived);
                break;
            case 'P2':
                bucketTasks = tasks.filter(t => t.priority && t.priority.includes('P2') && t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived);
                break;
            case 'P3':
                bucketTasks = tasks.filter(t => t.priority && t.priority.includes('P3') && t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived);
                break;
            case 'Backburner':
                bucketTasks = tasks.filter(t => t.priority === 'Backburner' && t.status !== 'Done' && t.status !== 'Deleted' && !t.is_archived);
                break;
            case 'Completed':
                bucketTasks = tasks.filter(t => {
                    if (t.status !== 'Done') return false;
                    const compDate = t.deletion_date || t.submitted_on || t.created_at || t.date;
                    return new Date(compDate) >= sevenDaysAgo;
                });
                break;
            default:
                break;
        }

        // Apply category filter if not 'All'
        if (categoryFilter !== 'All') {
            bucketTasks = bucketTasks.filter(t => t.category === categoryFilter);
        }

        return bucketTasks;
    };

    const columns = [
        { id: 'P1', title: 'P1 (Critical)', colorClass: 'text-red-500', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/20' },
        { id: 'P2', title: 'P2 (High)', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/20' },
        { id: 'P3', title: 'P3 (Normal)', colorClass: 'text-yellow-500', bgClass: 'bg-yellow-500/10', borderClass: 'border-yellow-500/20' },
        { id: 'Backburner', title: 'Backburner', colorClass: 'text-slate-400', bgClass: 'bg-slate-500/10', borderClass: 'border-slate-500/20' },
        { id: 'Completed', title: 'Done (7 Days)', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {columns.map(col => {
                const colTasks = getTasksByBucket(col.id);
                return (
                    <div key={col.id} className={`flex flex-col h-full bg-slate-900/40 rounded-2xl border ${col.borderClass} overflow-hidden`}>
                        {/* Column Header */}
                        <div className={`${col.bgClass} p-3 border-b ${col.borderClass} flex justify-between items-center`}>
                            <h3 className={`text-xs font-black uppercase tracking-wider ${col.colorClass}`}>{col.title}</h3>
                            <span className={`text-[10px] font-bold ${col.colorClass} opacity-70`}>{colTasks.length}</span>
                        </div>

                        {/* Task List */}
                        <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto max-h-[500px] no-scrollbar">
                            {colTasks.length === 0 ? (
                                <div className="text-center py-8 text-slate-600 italic text-xs">Clear</div>
                            ) : (
                                colTasks.map(task => (
                                    <div key={task.id} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 hover:border-slate-500/50 transition-colors group flex flex-col gap-2">
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => updateTask(task.id, 'status', task.status === 'Done' ? 'In Progress' : 'Done')}
                                                className={`shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'Done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-blue-400'}`}
                                            >
                                                {task.status === 'Done' && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-black uppercase text-blue-400 tracking-wider mb-1 truncate">
                                                    {task.assignee}
                                                </div>
                                                <textarea
                                                    value={task.action}
                                                    onChange={(e) => updateTask(task.id, 'action', e.target.value)}
                                                    className={`w-full bg-transparent border-none outline-none font-bold text-sm resize-none overflow-hidden block ${task.status === 'Done' ? 'text-slate-500' : 'text-slate-200 focus:text-blue-400'}`}
                                                    placeholder="Task description..."
                                                    rows={1}
                                                    onInput={(e) => {
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-start pt-1 border-t border-slate-700/30">
                                            <CategoryDropdown
                                                categories={categories}
                                                value={task.category || ''}
                                                onSelect={(name) => updateTask(task.id, 'category', name)}
                                                onAdd={addCategory}
                                                onDelete={deleteCategory}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
