import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qysvfwxutwnwvpkqbxkx.supabase.co';
const supabaseKey = 'sb_publishable_VPQNitbDqUJrv8awXqACJg_GVJGXvOl';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log("Cleaning up orphaned tasks...");

    // Wipe tasks with empty assignees
    const { data: dbData } = await supabase.from('tasks').select('*');
    if (dbData) {
        const nullAssignees = dbData.filter(t => !t.assignee || t.assignee === '');
        const idsToDelete = nullAssignees.map(t => t.id);
        if (idsToDelete.length > 0) {
            await supabase.from('tasks').delete().in('id', idsToDelete);
            console.log(`Deleted ${idsToDelete.length} orphaned tasks (IDs: ${idsToDelete.join(', ')})`);
        }
    }

    // "Remove Permanent contexts table 'Rooxter Films', 'Saas/Wunderloom', 'Family', 'Podast"
    console.log("Wiping pre-populated contexts...");
    const { error: ctxErr } = await supabase.from('contexts').delete().in('name', ['Rooxter Films', 'SaaS/Wunderloom', 'Family', 'Podcast']);
    if (ctxErr) console.error("Error wiping contexts:", ctxErr);
    else console.log("Default contexts removed!");
}

cleanup();

async function test() {
    console.log("Testing insert...");

    const newTask = {
        id: Date.now(),
        status: 'To Do',
        action: 'New action item...',
        category: '',
        due_by_type: 'This Week',
        priority: 'P2',
        target_deadline: new Date().toISOString(),
        submitted_on: new Date().toISOString(),
        energy: 'Medium',
        assignee: 'Test Assignee',
        is_archived: false,
        // missing date, created?
    };

    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (error) {
        console.error("INSERT ERROR IS:", error);
    } else {
        console.log("INSERT SUCCESS:", data);

        // Cleanup test insert
        await supabase.from('tasks').delete().eq('id', newTask.id);
    }

    // List all null assignees to see if there are lingering ones
    const { data: dbData } = await supabase.from('tasks').select('*');
    if (dbData) {
        const nullAssignees = dbData.filter(t => !t.assignee || t.assignee === '');
        console.log("Tasks with empty assignees:", nullAssignees.length);
        console.log("Empty assignee ids:", nullAssignees.map(t => t.id));
    }
}

test();
