export const STATUS_OPTIONS = ['To Do', 'In Progress', 'Blocked', 'Done'];
export const CATEGORY_OPTIONS = ['Rooxter Films', 'SaaS/Wunderloom', 'Family', 'Podcast'];
export const PRIORITY_OPTIONS = ['P1 (Critical)', 'P2 (High)', 'P3 (Normal)'];
export const ENERGY_OPTIONS = ['Low', 'Medium', 'High'];

export const DEFAULT_TASKS = [
    { id: 1, status: 'To Do', action: 'Draft pitch for Wunderloom', category: 'SaaS/Wunderloom', priority: 'P1 (Critical)', date: '2023-10-27', energy: 'High', created: '2023-10-20' },
    { id: 2, status: 'In Progress', action: 'Review VFX render farm queue', category: 'Rooxter Films', priority: 'P2 (High)', date: '2023-10-25', energy: 'Medium', created: '2023-10-15' },
    { id: 3, status: 'Blocked', action: 'Family photo shoot details', category: 'Family', priority: 'P3 (Normal)', date: '2023-11-05', energy: 'Low', created: '2023-10-18' },
    { id: 4, status: 'Done', action: 'Outline Podcast Episode 10', category: 'Podcast', priority: 'P2 (High)', date: '2023-10-20', energy: 'Medium', created: '2023-10-10' }
];
