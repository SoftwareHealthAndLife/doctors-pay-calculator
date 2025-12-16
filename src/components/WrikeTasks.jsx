import { ExternalLink, User } from 'lucide-react';
import './WrikeTasks.css';

const WrikeTasks = ({ tasks }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Completed': return 'status-completed';
      case 'Deferred': return 'status-deferred';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="wrike-tasks">
      {tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📋</span>
          <span className="empty-state-text">No Wrike tasks</span>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} className="wrike-task-item">
            <div className="wrike-task-content">
              <span className="wrike-task-title">{task.title}</span>
              <div className="wrike-task-meta">
                <span className={`wrike-status ${getStatusBadge(task.status)}`}>
                  {task.status}
                </span>
                {task.responsibleIds?.length > 0 && (
                  <span className="wrike-assignees">
                    <User size={12} />
                    {task.responsibleIds.length} assigned
                  </span>
                )}
              </div>
            </div>
            <a 
              href={task.permalink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="wrike-link"
              title="Open in Wrike"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        ))
      )}
    </div>
  );
};

export default WrikeTasks;
