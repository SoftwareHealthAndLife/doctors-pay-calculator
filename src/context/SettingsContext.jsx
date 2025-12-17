import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initSupabase, testSupabaseConnection, getSupabase } from '../services/supabase';
import { initWrike, testWrikeConnection, getWrikeConfig } from '../services/wrike';
import { initGoogleCalendar, authorizeGoogleCalendar, testGoogleCalendarConnection } from '../services/googleCalendar';
import { initGoogleChat, testGoogleChatConnection, getGoogleChatConfig } from '../services/googleChat';

const SettingsContext = createContext(null);

const STORAGE_KEY = 'doctors-pay-settings';

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    supabase: { url: 'https://ogvwqibfpvgdlqzyvyrk.supabase.co', 13 key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndndxaWJmcHZnZGxxenl2eXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNTcxOTYsImV4cCI6MjA0ODkzMzE5Nn0.V_bM5jcDuN62VZHnhPTdOgcAVXvtD3gBgM0nAkBqNks'
              },
    wrike: { token: '', folderId: '4333116655' },
    googleCalendar: { clientId: '' },
    googleChat: { webhookUrl: '' },
    user: { name: '', email: '' }
  });
  
  const [connections, setConnections] = useState({
    supabase: false,
    wrike: false,
    googleCalendar: false,
    googleChat: false
  });
  
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    setLoading(false);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, loading]);

  // Initialize services when settings change
  useEffect(() => {
    if (loading) return;
    
    // Init Supabase
    if (settings.supabase.url && settings.supabase.key) {
      initSupabase(settings.supabase.url, settings.supabase.key);
    }
    
    // Init Wrike
    if (settings.wrike.token && settings.wrike.folderId) {
      initWrike(settings.wrike.token, settings.wrike.folderId);
    }
    
    // Init Google Calendar
    if (settings.googleCalendar.clientId) {
      initGoogleCalendar(settings.googleCalendar.clientId);
    }
    
    // Init Google Chat
    if (settings.googleChat.webhookUrl) {
      initGoogleChat(settings.googleChat.webhookUrl);
    }
  }, [settings, loading]);

  const checkConnections = useCallback(async () => {
    const newConnections = { ...connections };
    
    // Check Supabase
    if (settings.supabase.url && settings.supabase.key) {
      newConnections.supabase = await testSupabaseConnection(settings.supabase.url, settings.supabase.key);
    } else {
      newConnections.supabase = false;
    }
    
    // Check Wrike
    if (settings.wrike.token) {
      newConnections.wrike = await testWrikeConnection(settings.wrike.token);
    } else {
      newConnections.wrike = false;
    }
    
    // Check Google Calendar
    newConnections.googleCalendar = await testGoogleCalendarConnection();
    
    // Check Google Chat (just validate URL format)
    if (settings.googleChat.webhookUrl) {
      newConnections.googleChat = await testGoogleChatConnection(settings.googleChat.webhookUrl);
    } else {
      newConnections.googleChat = false;
    }
    
    setConnections(newConnections);
    return newConnections;
  }, [settings, connections]);

  const updateSettings = useCallback((section, values) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...values }
    }));
  }, []);

  const connectSupabase = useCallback(async (url, key) => {
    const success = await testSupabaseConnection(url, key);
    if (success) {
      initSupabase(url, key);
      updateSettings('supabase', { url, key });
      setConnections(prev => ({ ...prev, supabase: true }));
    }
    return success;
  }, [updateSettings]);

  const connectWrike = useCallback(async (token, folderId) => {
    const success = await testWrikeConnection(token);
    if (success) {
      initWrike(token, folderId);
      updateSettings('wrike', { token, folderId });
      setConnections(prev => ({ ...prev, wrike: true }));
    }
    return success;
  }, [updateSettings]);

  const connectGoogleCalendar = useCallback(async (clientId) => {
    initGoogleCalendar(clientId);
    updateSettings('googleCalendar', { clientId });
    
    try {
      await authorizeGoogleCalendar();
      setConnections(prev => ({ ...prev, googleCalendar: true }));
      return true;
    } catch {
      return false;
    }
  }, [updateSettings]);

  const connectGoogleChat = useCallback(async (webhookUrl) => {
    const success = await testGoogleChatConnection(webhookUrl);
    if (success) {
      initGoogleChat(webhookUrl);
      updateSettings('googleChat', { webhookUrl });
      setConnections(prev => ({ ...prev, googleChat: true }));
    }
    return success;
  }, [updateSettings]);

  const value = {
    settings,
    connections,
    loading,
    updateSettings,
    checkConnections,
    connectSupabase,
    connectWrike,
    connectGoogleCalendar,
    connectGoogleChat
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
