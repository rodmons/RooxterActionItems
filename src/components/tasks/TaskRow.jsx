
import React from 'react';
import { Badge } from '../common/Badge';
import { Trash2 } from 'lucide-react';
import { STATUS_OPTIONS, PRIORITY_OPTIONS, CATEGORY_OPTIONS, ENERGY_LEVELS } from '../../constants';
import { calculateDaysOpen, formatDate } from '../../utils/dateUtils';
import { cn } from '../../utils/cn';

export function TaskRow({ task, onUpdate, onDelete }) {
    const handleChange = (field, value) => {
        onUpdate(task.id, field, value);
    };

    const getStatusColor = (status) => {
        const option = STATUS_OPTIONS.find(o => o.value === status);
        return option ? option.color : 'slate';
    };

    const getPriorityColor = (priority) => {
        const option = PRIORITY_OPTIONS.find(o => o.value === priority);
        return option ? option.textClass || (option.value.includes('P1') ? 'text-amber-400' : option.value.includes('P2') ? 'text-orange-400' : 'text-blue-400') : 'text-slate-400';
    };

    return (
        <tr className="group hover:bg-slate-900/40 transition-colors border-b border-slate-800/50 last:border-0">
            {/* Status */}
            <td className="px-6 py-4">
                <select
                    value={task.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={cn(
                        "bg-transparent text-xs font-semibold py-1 px-2 rounded-full border cursor-pointer outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none",
                        getStatusColor(task.status) === 'slate' && "bg-slate-500/10 text-slate-400 border-slate-500/20",
                        getStatusColor(task.status) === 'blue' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                        getStatusColor(task.status) === 'red' && "bg-red-500/10 text-red-400 border-red-500/20",
                        getStatusColor(task.status) === 'emerald' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    )}
                >
                    {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">
                            {opt.label}
                        </option>
                    ))}
                </select>
            </td>

            {/* Action Item Name */}
            <td className="px-6 py-4 w-1/3">
                <input
                    type="text"
                    value={task.action}
                    onChange={(e) => handleChange('action', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-600 focus:text-blue-400 transition-colors"
                    placeholder="Describe the action item..."
                />
            </td>

            {/* Category */}
            <td className="px-6 py-4">
                <select
                    value={task.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="bg-transparent text-sm text-slate-400 hover:text-slate-200 cursor-pointer outline-none"
                >
                    {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">
                            {opt.label}
                        </option>
                    ))}
                </select>
            </td>

            {/* Priority */}
            <td className="px-6 py-4">
                <select
                    value={task.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className={cn(
                        "bg-transparent text-xs font-bold cursor-pointer outline-none uppercase tracking-wide",
                        getPriorityColor(task.priority)
                    )}
                >
                    {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">
                            {opt.label}
                        </option>
                    ))}
                </select>
            </td>

            {/* Due Date */}
            <td className="px-6 py-4">
                <input
                    type="date"
                    value={task.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="bg-transparent text-xs text-slate-500 hover:text-slate-300 cursor-pointer outline-none uppercase tracking-wider"
                />
            </td>

            {/* Energy */}
            <td className="px-6 py-4">
                <select
                    value={task.energy}
                    onChange={(e) => handleChange('energy', e.target.value)}
                    className="bg-transparent text-xs text-slate-500 hover:text-slate-300 cursor-pointer outline-none uppercase tracking-tight"
                >
                    {ENERGY_LEVELS.map(lvl => (
                        <option key={lvl} value={lvl} className="bg-slate-900 text-slate-300">
                            {lvl}
                        </option>
                    ))}
                </select>
            </td>

            {/* Days Open */}
            <td className="px-6 py-4 text-center">
                <span className="text-xs font-mono text-slate-600">
                    {task.status === 'Done' ? '-' : calculateDaysOpen(task.created)}
                </span>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => onDelete(task.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors bg-transparent border-0 cursor-pointer p-1 rounded-md hover:bg-red-500/10"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
