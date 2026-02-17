
import React from 'react';
import { cn } from '../../utils/cn'; // We need to create this util

const colorStyles = {
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export function Badge({ children, color = 'slate', className, icon: Icon }) {
    const styles = colorStyles[color] || colorStyles.slate;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all",
            styles,
            className
        )}>
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
}
