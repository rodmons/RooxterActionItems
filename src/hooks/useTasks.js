import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// Helper to calculate stats from tasks array
const calculateStats = (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    return {
        dueToday: tasks.filter(t => t.date === today && t.status !== 'Done').length,
        p1: tasks.filter(t => t.priority.includes('P1') && t.status !== 'Done').length,
        blocked: tasks.filter(t => t.status === 'Blocked').length,
        completed: tasks.filter(t => t.status === 'Done').length,
    };
};

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial fetch
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('id', { ascending: false }); // Newest first

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        const today = new Date().toISOString().split('T')[0];
        const newTask = {
            id: Date.now(), // Using timestamp as ID for simplicity, fits in bigint
            status: 'To Do',
            action: 'New action item...',
            category: 'Rooxter Films',
            priority: 'P2 (High)',
            date: today,
            energy: 'Medium',
            created: today
        };

        // Optimistic update
        setTasks([newTask, ...tasks]);

        const { error } = await supabase
            .from('tasks')
            .insert([newTask]);

        if (error) {
            console.error('Error adding task:', error);
            // Revert on error (optional, simple fetch for now)
            fetchTasks();
        }
    };

    const updateTask = async (id, field, value) => {
        // Optimistic update
        setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));

        const { error } = await supabase
            .from('tasks')
            .update({ [field]: value })
            .eq('id', id);

        if (error) {
            console.error('Error updating task:', error);
            fetchTasks(); // Revert/Sync
        }
    };

    const deleteTask = async (id) => {
        // Optimistic update
        setTasks(tasks.filter(t => t.id !== id));

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting task:', error);
            fetchTasks();
        }
    };

    const resetData = async () => {
        // Not implementing full delete-all for now to be safe, 
        // or could just re-fetch to sync with backend.
        if (confirm('Reload data from server?')) {
            fetchTasks();
        }
    };

    const stats = useMemo(() => calculateStats(tasks), [tasks]);

    return { tasks, stats, addTask, updateTask, deleteTask, resetData, loading };
}
