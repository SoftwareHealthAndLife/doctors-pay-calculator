import { useState } from 'react';
import { AlertTriangle, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import './DelayLogger.css';

const DelayLogger = ({ delays, tasks, onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    task_id: '',
    task_title: '',
    reason: '',
    category: 'technical',
    duration: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) return;
    
    await onAdd(formData);
    setFormData({ task_id: '', task_title: '', reason: '', category: 'technical', duration: '' });
    setShowForm(false);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'technical': return 'delay-technical';
      case 'resource': return 'delay-resource';
      case 'external': return 'delay-external';
      case 'scope': return 'delay-scope';
      default: return 'delay-other';
    }
  };

  return (
    <div className="delay-logger">
      {!showForm && (
        <button className="add-delay-btn" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Log Delay
        </button>
      )}
      
      {showForm && (
        <form className="delay-form" onSubmit={handleSubmit}>
          <select
            value={formData.task_id}
            onChange={(e) => {
              const task = tasks.find(t => t.id === e.target.value);
              setFormData(prev => ({ 
                ...prev, 
                task_id: e.target.value,
                task_title: task?.title || ''
              }));
            }}
          >
            <option value="">Select task (optional)</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Task name (if not in list)"
            value={formData.task_title}
            onChange={(e) => setFormData(prev => ({ ...prev, task_title: e.target.value }))}
          />
          
          <textarea
            placeholder="Reason for delay..."
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            rows={2}
            required
          />
          
          <div className="form-row">
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="technical">Technical</option>
              <option value="resource">Resource</option>
              <option value="external">External</option>
              <option value="scope">Scope Change</option>
              <option value="other">Other</option>
            </select>
            
            <input
              type="text"
              placeholder="Duration (e.g., 2 days)"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-cancel" 
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-save delay">
              Log Delay
            </button>
          </div>
        </form>
      )}
      
      <div className="delays">
        {delays.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">⏱️</span>
            <span className="empty-state-text">No delays logged</span>
          </div>
        ) : (
          delays.map(delay => (
            <div key={delay.id} className="delay-item">
              <div className="delay-header">
                <AlertTriangle size={14} className="delay-icon" />
                <span className="delay-task">{delay.task_title || 'General'}</span>
                <span className={`delay-category ${getCategoryColor(delay.category)}`}>
                  {delay.category}
                </span>
              </div>
              
              <p className="delay-reason">{delay.reason}</p>
              
              <div className="delay-footer">
                {delay.duration && (
                  <span className="delay-duration">
                    <Clock size={12} />
                    {delay.duration}
                  </span>
                )}
                <span className="delay-date">
                  {format(new Date(delay.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DelayLogger;
