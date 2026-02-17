import { useState, useEffect, useMemo } from 'react';
import { DEFAULT_TASKS } from '../constants';

export function useTasks() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('rooxter_tasks');
        return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    });

    useEffect(() => {
        localStorage.setItem('rooxter_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return {
            dueToday: tasks.filter(t => t.date === today && t.status !== 'Done').length,
            p1: tasks.filter(t => t.priority.includes('P1') && t.status !== 'Done').length,
            blocked: tasks.filter(t => t.status === 'Blocked').length,
            completed: tasks.filter(t => t.status === 'Done').length,
        };
    }, [tasks]);

    const addTask = () => {
        const today = new Date().toISOString().split('T')[0];
        const newTask = {
            id: Date.now(),
            status: 'To Do',
            action: 'New Action...',
            category: 'Rooxter Films',
            priority: 'P2 (High)',
            date: today,
            energy: 'Medium',
            created: today
        };
        setTasks([newTask, ...tasks]);
    };

    const updateTask = (id, field, value) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return { tasks, stats, addTask, updateTask, deleteTask, setTasks };
}
