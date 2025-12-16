import { useState, useEffect, useCallback } from 'react';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  fetchActivity,
  logActivity,
  fetchDelays,
  createDelay,
  subscribeToTasks,
  subscribeToNotes,
  subscribeToActivity,
  unsubscribe,
  getSupabase
} from '../services/supabase';
import { createWrikeTask, updateWrikeTask, addWrikeComment, fetchWrikeTasks } from '../services/wrike';
import { createCalendarEvent, fetchCalendarEvents } from '../services/googleCalendar';
import { sendTaskNotification, sendDelayNotification } from '../services/googleChat';
import { useSettings } from '../context/SettingsContext';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { connections } = useSettings();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const data = await fetchTasks();
    setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (connections.supabase) {
      loadTasks();
      
      const subscription = subscribeToTasks((payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      });
      
      return () => unsubscribe(subscription);
    }
  }, [connections.supabase, loadTasks]);

  const addTask = useCallback(async (taskData, syncToWrike = true, syncToCalendar = true) => {
    const task = await createTask(taskData);
    if (task) {
      await logActivity(`Created task: ${task.title}`, 'supabase', { taskId: task.id });
      
      // Sync to Wrike
      if (syncToWrike && connections.wrike) {
        const wrikeTask = await createWrikeTask(task.title, task.description, [], task.due_date);
        if (wrikeTask) {
          await updateTask(task.id, { wrike_id: wrikeTask.id });
        }
      }
      
      // Sync to Calendar
      if (syncToCalendar && connections.googleCalendar && task.due_date) {
        const event = await createCalendarEvent(
          task.title,
          task.description,
          task.due_date,
          null,
          task.assignees || []
        );
        if (event) {
          await updateTask(task.id, { calendar_event_id: event.id });
        }
      }
      
      // Notify in chat
      if (connections.googleChat) {
        await sendTaskNotification('created', task.title, task.assignee);
      }
    }
    return task;
  }, [connections]);

  const editTask = useCallback(async (id, updates, syncAll = true) => {
    const task = await updateTask(id, updates);
    if (task) {
      await logActivity(`Updated task: ${task.title}`, 'supabase', { taskId: task.id });
      
      // Sync to Wrike
      if (syncAll && connections.wrike && task.wrike_id) {
        await updateWrikeTask(task.wrike_id, updates);
      }
      
      // Notify in chat
      if (connections.googleChat) {
        await sendTaskNotification('updated', task.title);
      }
    }
    return task;
  }, [connections]);

  const removeTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    const success = await deleteTask(id);
    if (success && task) {
      await logActivity(`Deleted task: ${task.title}`, 'supabase');
      
      if (connections.googleChat) {
        await sendTaskNotification('deleted', task.title);
      }
    }
    return success;
  }, [tasks, connections]);

  const toggleTaskComplete = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return null;
    
    const newStatus = task.status === 'completed' ? 'active' : 'completed';
    const updated = await editTask(id, { status: newStatus });
    
    if (updated && newStatus === 'completed' && connections.googleChat) {
      await sendTaskNotification('completed', task.title);
    }
    
    return updated;
  }, [tasks, editTask, connections]);

  return {
    tasks,
    loading,
    loadTasks,
    addTask,
    editTask,
    removeTask,
    toggleTaskComplete
  };
};

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { connections } = useSettings();

  const loadNotes = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotes();
    setNotes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (connections.supabase) {
      loadNotes();
      
      const subscription = subscribeToNotes((payload) => {
        if (payload.eventType === 'INSERT') {
          setNotes(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotes(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
        } else if (payload.eventType === 'DELETE') {
          setNotes(prev => prev.filter(n => n.id !== payload.old.id));
        }
      });
      
      return () => unsubscribe(subscription);
    }
  }, [connections.supabase, loadNotes]);

  const addNote = useCallback(async (noteData, syncToWrike = true) => {
    const note = await createNote(noteData);
    if (note) {
      await logActivity(`Created note: ${note.title}`, 'supabase', { noteId: note.id });
      
      // Add as comment to Wrike if linked to a task
      if (syncToWrike && connections.wrike && noteData.wrike_task_id) {
        await addWrikeComment(noteData.wrike_task_id, note.content);
      }
    }
    return note;
  }, [connections]);

  const editNote = useCallback(async (id, updates) => {
    const note = await updateNote(id, updates);
    if (note) {
      await logActivity(`Updated note: ${note.title}`, 'supabase', { noteId: note.id });
    }
    return note;
  }, []);

  const removeNote = useCallback(async (id) => {
    const note = notes.find(n => n.id === id);
    const success = await deleteNote(id);
    if (success && note) {
      await logActivity(`Deleted note: ${note.title}`, 'supabase');
    }
    return success;
  }, [notes]);

  return {
    notes,
    loading,
    loadNotes,
    addNote,
    editNote,
    removeNote
  };
};

export const useActivity = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { connections } = useSettings();

  const loadActivity = useCallback(async () => {
    setLoading(true);
    const data = await fetchActivity();
    setActivity(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (connections.supabase) {
      loadActivity();
      
      const subscription = subscribeToActivity((payload) => {
        if (payload.eventType === 'INSERT') {
          setActivity(prev => [payload.new, ...prev.slice(0, 19)]);
        }
      });
      
      return () => unsubscribe(subscription);
    }
  }, [connections.supabase, loadActivity]);

  return {
    activity,
    loading,
    loadActivity,
    logActivity
  };
};

export const useDelays = () => {
  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const { connections } = useSettings();

  const loadDelays = useCallback(async () => {
    setLoading(true);
    const data = await fetchDelays();
    setDelays(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (connections.supabase) {
      loadDelays();
    }
  }, [connections.supabase, loadDelays]);

  const addDelay = useCallback(async (delayData) => {
    const delay = await createDelay(delayData);
    if (delay) {
      setDelays(prev => [delay, ...prev]);
      await logActivity(`Logged delay: ${delayData.reason}`, 'supabase', { delayId: delay.id });
      
      if (connections.googleChat) {
        await sendDelayNotification(
          delayData.task_title,
          delayData.reason,
          delayData.category,
          delayData.duration
        );
      }
    }
    return delay;
  }, [connections]);

  return {
    delays,
    loading,
    loadDelays,
    addDelay
  };
};

export const useWrikeTasks = () => {
  const [wrikeTasks, setWrikeTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { connections } = useSettings();

  const loadWrikeTasks = useCallback(async () => {
    if (!connections.wrike) return;
    setLoading(true);
    const data = await fetchWrikeTasks();
    setWrikeTasks(data);
    setLoading(false);
  }, [connections.wrike]);

  useEffect(() => {
    if (connections.wrike) {
      loadWrikeTasks();
    }
  }, [connections.wrike, loadWrikeTasks]);

  return {
    wrikeTasks,
    loading,
    loadWrikeTasks
  };
};

export const useCalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { connections } = useSettings();

  const loadEvents = useCallback(async (timeMin, timeMax) => {
    if (!connections.googleCalendar) return;
    setLoading(true);
    const data = await fetchCalendarEvents(timeMin, timeMax);
    setEvents(data);
    setLoading(false);
  }, [connections.googleCalendar]);

  useEffect(() => {
    if (connections.googleCalendar) {
      loadEvents();
    }
  }, [connections.googleCalendar, loadEvents]);

  return {
    events,
    loading,
    loadEvents
  };
};
