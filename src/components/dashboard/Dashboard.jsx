
import React from 'react';
import { StatCard } from '../dashboard/StatCard';
import { Calendar, Zap, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

export function Dashboard({ tasks }) {
    const todayStr = getTodayString();

    const dueToday = tasks.filter(t => t.date === todayStr && t.status !== 'Done').length;
    const critical = tasks.filter(t => t.priority.includes('P1') && t.status !== 'Done').length;
    const blocked = tasks.filter(t => t.status === 'Blocked').length;
    const done = tasks.filter(t => t.status === 'Done').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            <StatCard
                title="Due Today"
                value={dueToday}
                icon={Calendar}
                colorClass="text-blue-400"
            />
            <StatCard
                title="Critical (P1)"
                value={critical}
                icon={Zap}
                colorClass="text-amber-400"
            />
            <StatCard
                title="Blocked"
                value={blocked}
                icon={AlertOctagon}
                colorClass="text-red-400"
            />
            <StatCard
                title="Completed"
                value={done}
                icon={CheckCircle2}
                colorClass="text-emerald-400"
            />
        </div>
    );
}
