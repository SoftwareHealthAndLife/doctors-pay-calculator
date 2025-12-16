import { RefreshCw } from 'lucide-react';
import './Panel.css';

const Panel = ({ title, icon, children, onRefresh, loading = false, actions }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="panel-icon">{icon}</span>
          {title}
        </h2>
        <div className="panel-actions">
          {actions}
          {onRefresh && (
            <button 
              className="btn btn-icon-small" 
              onClick={onRefresh}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          )}
        </div>
      </div>
      <div className="panel-content">
        {loading ? (
          <div className="panel-loading">
            <RefreshCw size={24} className="spin" />
            <span>Loading...</span>
          </div>
        ) : children}
      </div>
    </div>
  );
};

export default Panel;
