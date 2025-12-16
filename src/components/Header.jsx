import { Settings, RefreshCw, Github, ExternalLink } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './Header.css';

const Header = ({ onOpenSettings, onRefresh }) => {
  const { connections, settings } = useSettings();
  
  const connectionCount = Object.values(connections).filter(Boolean).length;
  
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">💊</span>
            <div className="logo-text">
              <h1>Doctors' Pay Calculator</h1>
              <span className="subtitle">Project Dashboard</span>
            </div>
          </div>
        </div>
        
        <div className="header-center">
          <div className="connection-indicators">
            <div className={`indicator ${connections.supabase ? 'connected' : ''}`} title="Supabase">
              <span className="dot"></span>
              <span className="label">Supabase</span>
            </div>
            <div className={`indicator ${connections.wrike ? 'connected' : ''}`} title="Wrike">
              <span className="dot"></span>
              <span className="label">Wrike</span>
            </div>
            <div className={`indicator ${connections.googleCalendar ? 'connected' : ''}`} title="Google Calendar">
              <span className="dot"></span>
              <span className="label">Calendar</span>
            </div>
            <div className={`indicator ${connections.googleChat ? 'connected' : ''}`} title="Google Chat">
              <span className="dot"></span>
              <span className="label">Chat</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          {settings.user.name && (
            <div className="user-badge">
              <span className="user-avatar">{settings.user.name.charAt(0)}</span>
              <span className="user-name">{settings.user.name}</span>
            </div>
          )}
          
          <div className="header-actions">
            <a 
              href="https://github.com/SoftwareHealthAndLife/doctors-pay-calculator" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-icon"
              title="GitHub Repository"
            >
              <Github size={18} />
            </a>
            
            <a 
              href="https://www.wrike.com/open.htm?id=4333116655" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-icon"
              title="Open Wrike"
            >
              <ExternalLink size={18} />
            </a>
            
            <button 
              className="btn btn-icon" 
              onClick={onRefresh}
              title="Refresh All"
            >
              <RefreshCw size={18} />
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={onOpenSettings}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
