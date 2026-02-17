
import React from 'react';
import { TaskRow } from './TaskRow';

export function TaskTable({ tasks, onUpdate, onDelete }) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500">No active tasks found in this view.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <tr>
                        <th className="px-6 py-4 font-semibold w-32">Status</th>
                        <th className="px-6 py-4 font-semibold">Action Item</th>
                        <th className="px-6 py-4 font-semibold w-40">Category</th>
                        <th className="px-6 py-4 font-semibold w-32">Priority</th>
                        <th className="px-6 py-4 font-semibold w-32">Due Date</th>
                        <th className="px-6 py-4 font-semibold w-24">Energy</th>
                        <th className="px-6 py-4 font-semibold text-center w-20">Days</th>
                        <th className="px-6 py-4 font-semibold text-right w-16"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {tasks.map(task => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
