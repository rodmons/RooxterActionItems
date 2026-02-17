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
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksResult, teamsResult] = await Promise.all([
                supabase.from('tasks').select('*').order('id', { ascending: false }),
                supabase.from('team_members').select('*').order('name', { ascending: true })
            ]);

            if (tasksResult.error) throw tasksResult.error;
            if (teamsResult.error) throw teamsResult.error;

            setTasks(tasksResult.data || []);
            setTeamMembers(teamsResult.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTeamMember = async (name) => {
        const newMember = { name };
        // Optimistic
        setTeamMembers([...teamMembers, { id: Date.now(), ...newMember }]);

        const { data, error } = await supabase
            .from('team_members')
            .insert([newMember])
            .select();

        if (error) {
            console.error('Error adding team member:', error);
            fetchData(); // Revert
        } else if (data) {
            // Update with real ID
            setTeamMembers(prev => prev.map(m => m.name === name ? data[0] : m));
        }
        return data;
    };

    const addTask = async (assignee) => {
        const today = new Date().toISOString().split('T')[0];
        const newTask = {
            id: Date.now(),
            status: 'To Do',
            action: 'New action item...',
            category: 'Rooxter Films',
            priority: 'P2 (High)',
            date: today,
            energy: 'Medium',
            created: today,
            assignee: assignee
        };

        setTasks([newTask, ...tasks]);

        const { error } = await supabase
            .from('tasks')
            .insert([newTask]);

        if (error) {
            console.error('Error adding task:', error);
            fetchData();
        }
    };

    const updateTask = async (id, field, value) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));

        const { error } = await supabase
            .from('tasks')
            .update({ [field]: value })
            .eq('id', id);

        if (error) {
            console.error('Error updating task:', error);
            fetchData();
        }
    };

    const deleteTask = async (id) => {
        setTasks(tasks.filter(t => t.id !== id));

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting task:', error);
            fetchData();
        }
    };

    const resetData = async () => {
        if (confirm('Reload data from server?')) {
            fetchData();
        }
    };

    const stats = useMemo(() => calculateStats(tasks), [tasks]);

    return { tasks, teamMembers, stats, addTask, addTeamMember, updateTask, deleteTask, resetData, loading };
}
