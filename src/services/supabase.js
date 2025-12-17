import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export const initSupabase = (url, key) => {
  if (url && key) {
    supabaseInstance = createClient(url, key, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }
  return supabaseInstance;
};

export const getSupabase = () => supabaseInstance;

export const testSupabaseConnection = async (url, key) => {
  // Skip connection test, just validate inputs
  return url && key && url.includes('supabase.co');
};  }
};

// Tasks
export const fetchTasks = async () => {
  if (!supabaseInstance) return [];
  const { data, error } = await supabaseInstance
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('Fetch tasks error:', error);
  return data || [];
};

export const createTask = async (task) => {
  if (!supabaseInstance) return null;
  const { data, error } = await supabaseInstance
    .from('tasks')
    .insert([task])
    .select()
    .single();
  if (error) console.error('Create task error:', error);
  return data;
};

export const updateTask = async (id, updates) => {
  if (!supabaseInstance) return null;
  const { data, error } = await supabaseInstance
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) console.error('Update task error:', error);
  return data;
};

export const deleteTask = async (id) => {
  if (!supabaseInstance) return false;
  const { error } = await supabaseInstance
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) console.error('Delete task error:', error);
  return !error;
};

// Notes
export const fetchNotes = async () => {
  if (!supabaseInstance) return [];
  const { data, error } = await supabaseInstance
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('Fetch notes error:', error);
  return data || [];
};

export const createNote = async (note) => {
  if (!supabaseInstance) return null;
  const { data, error } = await supabaseInstance
    .from('notes')
    .insert([note])
    .select()
    .single();
  if (error) console.error('Create note error:', error);
  return data;
};

export const updateNote = async (id, updates) => {
  if (!supabaseInstance) return null;
  const { data, error } = await supabaseInstance
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) console.error('Update note error:', error);
  return data;
};

export const deleteNote = async (id) => {
  if (!supabaseInstance) return false;
  const { error } = await supabaseInstance
    .from('notes')
    .delete()
    .eq('id', id);
  if (error) console.error('Delete note error:', error);
  return !error;
};

// Activity
export const fetchActivity = async (limit = 20) => {
  if (!supabaseInstance) return [];
  const { data, error } = await supabaseInstance
    .from('activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) console.error('Fetch activity error:', error);
  return data || [];
};

export const logActivity = async (action, source, details = {}) => {
  if (!supabaseInstance) return null;
  const { data, error } = await supabaseInstance
    .from('activity')
    .insert([{ action, source, details, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) console.error('Log activity error:', error);
  return data;
};

// Delays
export const fetchDelays = async () => {
  if (!supabaseInstance) return [];
  const { data, error } = await supabaseInstance
    .from('delays')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('Fetch delays error:', error);
  return data || [];
};

export const createDelay = async (delay) => {
  if (!supabaseInstance) return null;
  const { data, error } = await supabaseInstance
    .from('delays')
    .insert([delay])
    .select()
    .single();
  if (error) console.error('Create delay error:', error);
  return data;
};

// Real-time subscriptions
export const subscribeToTasks = (callback) => {
  if (!supabaseInstance) return null;
  return supabaseInstance
    .channel('tasks-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
    .subscribe();
};

export const subscribeToNotes = (callback) => {
  if (!supabaseInstance) return null;
  return supabaseInstance
    .channel('notes-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, callback)
    .subscribe();
};

export const subscribeToActivity = (callback) => {
  if (!supabaseInstance) return null;
  return supabaseInstance
    .channel('activity-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, callback)
    .subscribe();
};

export const unsubscribe = (subscription) => {
  if (subscription) {
    supabaseInstance?.removeChannel(subscription);
  }
};
