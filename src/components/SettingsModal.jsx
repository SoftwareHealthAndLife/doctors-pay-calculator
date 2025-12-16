import { useState, useEffect } from 'react';
import { X, Check, Loader2, ExternalLink } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { authorizeGoogleCalendar } from '../services/googleCalendar';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { 
    settings, 
    connections, 
    connectSupabase, 
    connectWrike, 
    connectGoogleCalendar,
    connectGoogleChat,
    updateSettings 
  } = useSettings();
  
  const [formData, setFormData] = useState({
    supabaseUrl: '',
    supabaseKey: '',
    wrikeToken: '',
    wrikeFolderId: '',
    googleClientId: '',
    chatWebhookUrl: '',
    userName: '',
    userEmail: ''
  });
  
  const [connecting, setConnecting] = useState({
    supabase: false,
    wrike: false,
    googleCalendar: false,
    googleChat: false
  });

  useEffect(() => {
    setFormData({
      supabaseUrl: settings.supabase.url || '',
      supabaseKey: settings.supabase.key || '',
      wrikeToken: settings.wrike.token || '',
      wrikeFolderId: settings.wrike.folderId || '',
      googleClientId: settings.googleCalendar.clientId || '',
      chatWebhookUrl: settings.googleChat.webhookUrl || '',
      userName: settings.user.name || '',
      userEmail: settings.user.email || ''
    });
  }, [settings, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConnectSupabase = async () => {
    setConnecting(prev => ({ ...prev, supabase: true }));
    await connectSupabase(formData.supabaseUrl, formData.supabaseKey);
    setConnecting(prev => ({ ...prev, supabase: false }));
  };

  const handleConnectWrike = async () => {
    setConnecting(prev => ({ ...prev, wrike: true }));
    await connectWrike(formData.wrikeToken, formData.wrikeFolderId);
    setConnecting(prev => ({ ...prev, wrike: false }));
  };

  const handleConnectGoogleCalendar = async () => {
    setConnecting(prev => ({ ...prev, googleCalendar: true }));
    try {
      await connectGoogleCalendar(formData.googleClientId);
    } catch (e) {
      console.error('Google Calendar auth failed:', e);
    }
    setConnecting(prev => ({ ...prev, googleCalendar: false }));
  };

  const handleConnectGoogleChat = async () => {
    setConnecting(prev => ({ ...prev, googleChat: true }));
    await connectGoogleChat(formData.chatWebhookUrl);
    setConnecting(prev => ({ ...prev, googleChat: false }));
  };

  const handleSaveUser = () => {
    updateSettings('user', { 
      name: formData.userName, 
      email: formData.userEmail 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Integration Settings</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* User Section */}
          <section className="settings-section">
            <h3>👤 User Profile</h3>
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="e.g., AO or PE"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>
            <button className="btn btn-secondary" onClick={handleSaveUser}>
              Save Profile
            </button>
          </section>

          {/* Supabase Section */}
          <section className="settings-section">
            <div className="section-header">
              <h3>🗄️ Supabase</h3>
              <span className={`status-badge ${connections.supabase ? 'connected' : ''}`}>
                {connections.supabase ? <><Check size={14} /> Connected</> : 'Disconnected'}
              </span>
            </div>
            <div className="form-group">
              <label>Project URL</label>
              <input
                type="text"
                name="supabaseUrl"
                value={formData.supabaseUrl}
                onChange={handleChange}
                placeholder="https://xxxxx.supabase.co"
              />
            </div>
            <div className="form-group">
              <label>
                Anon Key
                <a 
                  href="https://supabase.com/dashboard/project/ogvwqibfpvgdlqzyvyrk/settings/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  Get Key <ExternalLink size={12} />
                </a>
              </label>
              <input
                type="password"
                name="supabaseKey"
                value={formData.supabaseKey}
                onChange={handleChange}
                placeholder="eyJhbGciOiJIUzI1NiIs..."
              />
            </div>
            <button 
              className="btn btn-connect" 
              onClick={handleConnectSupabase}
              disabled={connecting.supabase}
            >
              {connecting.supabase ? <Loader2 size={16} className="spin" /> : null}
              {connections.supabase ? 'Reconnect' : 'Connect'}
            </button>
          </section>

          {/* Wrike Section */}
          <section className="settings-section">
            <div className="section-header">
              <h3>📋 Wrike</h3>
              <span className={`status-badge ${connections.wrike ? 'connected' : ''}`}>
                {connections.wrike ? <><Check size={14} /> Connected</> : 'Disconnected'}
              </span>
            </div>
            <div className="form-group">
              <label>
                Access Token
                <a 
                  href="https://www.wrike.com/frontend/apps/index.html#/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  Get Token <ExternalLink size={12} />
                </a>
              </label>
              <input
                type="password"
                name="wrikeToken"
                value={formData.wrikeToken}
                onChange={handleChange}
                placeholder="Enter your Wrike API token"
              />
            </div>
            <div className="form-group">
              <label>Folder ID</label>
              <input
                type="text"
                name="wrikeFolderId"
                value={formData.wrikeFolderId}
                onChange={handleChange}
                placeholder="4333116655"
              />
            </div>
            <button 
              className="btn btn-connect" 
              onClick={handleConnectWrike}
              disabled={connecting.wrike}
            >
              {connecting.wrike ? <Loader2 size={16} className="spin" /> : null}
              {connections.wrike ? 'Reconnect' : 'Connect'}
            </button>
          </section>

          {/* Google Calendar Section */}
          <section className="settings-section">
            <div className="section-header">
              <h3>📅 Google Calendar</h3>
              <span className={`status-badge ${connections.googleCalendar ? 'connected' : ''}`}>
                {connections.googleCalendar ? <><Check size={14} /> Connected</> : 'Disconnected'}
              </span>
            </div>
            <div className="form-group">
              <label>
                OAuth Client ID
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="help-link"
                >
                  Get ID <ExternalLink size={12} />
                </a>
              </label>
              <input
                type="text"
                name="googleClientId"
                value={formData.googleClientId}
                onChange={handleChange}
                placeholder="xxxxx.apps.googleusercontent.com"
              />
            </div>
            <button 
              className="btn btn-connect" 
              onClick={handleConnectGoogleCalendar}
              disabled={connecting.googleCalendar}
            >
              {connecting.googleCalendar ? <Loader2 size={16} className="spin" /> : null}
              {connections.googleCalendar ? 'Reconnect' : 'Authorize'}
            </button>
          </section>

          {/* Google Chat Section */}
          <section className="settings-section">
            <div className="section-header">
              <h3>💬 Google Chat</h3>
              <span className={`status-badge ${connections.googleChat ? 'connected' : ''}`}>
                {connections.googleChat ? <><Check size={14} /> Connected</> : 'Disconnected'}
              </span>
            </div>
            <div className="form-group">
              <label>Webhook URL</label>
              <input
                type="text"
                name="chatWebhookUrl"
                value={formData.chatWebhookUrl}
                onChange={handleChange}
                placeholder="https://chat.googleapis.com/v1/spaces/..."
              />
              <small>Create webhook in Google Chat space → Apps & integrations → Webhooks</small>
            </div>
            <button 
              className="btn btn-connect" 
              onClick={handleConnectGoogleChat}
              disabled={connecting.googleChat}
            >
              {connecting.googleChat ? <Loader2 size={16} className="spin" /> : null}
              {connections.googleChat ? 'Reconnect' : 'Connect'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
