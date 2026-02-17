
import {
    CheckCircle2,
    Circle,
    Clock,
    AlertOctagon,
    Film,
    Cpu,
    Users,
    Mic
} from 'lucide-react';

export const STATUS_OPTIONS = [
    { value: 'To Do', label: 'To Do', color: 'slate', icon: Circle },
    { value: 'In Progress', label: 'In Progress', color: 'blue', icon: Clock },
    { value: 'Blocked', label: 'Blocked', color: 'red', icon: AlertOctagon },
    { value: 'Done', label: 'Done', color: 'emerald', icon: CheckCircle2 },
];

export const PRIORITY_OPTIONS = [
    { value: 'P1 (Critical)', label: 'P1 (Critical)', color: 'amber' },
    { value: 'P2 (High)', label: 'P2 (High)', color: 'orange' },
    { value: 'P3 (Normal)', label: 'P3 (Normal)', color: 'blue' },
];

export const CATEGORY_OPTIONS = [
    { value: 'Rooxter Films', label: 'Rooxter Films', icon: Film },
    { value: 'SaaS/Wunderloom', label: 'SaaS/Wunderloom', icon: Cpu },
    { value: 'Family', label: 'Family', icon: Users },
    { value: 'Podcast', label: 'Podcast', icon: Mic },
];

export const ENERGY_LEVELS = ['Low', 'Medium', 'High'];
