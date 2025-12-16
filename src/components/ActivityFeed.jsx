import { format, formatDistanceToNow } from 'date-fns';
import './ActivityFeed.css';

const ActivityFeed = ({ activity }) => {
  const getSourceIcon = (source) => {
    switch (source) {
      case 'supabase': return '🗄️';
      case 'wrike': return '📋';
      case 'calendar': return '📅';
      case 'chat': return '💬';
      default: return '📌';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'supabase': return 'source-supabase';
      case 'wrike': return 'source-wrike';
      case 'calendar': return 'source-calendar';
      case 'chat': return 'source-chat';
      default: return '';
    }
  };

  return (
    <div className="activity-feed">
      {activity.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📜</span>
          <span className="empty-state-text">No activity yet</span>
        </div>
      ) : (
        activity.map(item => (
          <div key={item.id} className="activity-item">
            <span className={`activity-source ${getSourceColor(item.source)}`}>
              {getSourceIcon(item.source)}
            </span>
            <div className="activity-content">
              <span className="activity-action">{item.action}</span>
              <span className="activity-time">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ActivityFeed;
