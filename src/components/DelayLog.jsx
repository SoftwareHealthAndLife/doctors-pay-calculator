import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import './DelayLog.css';

const CATEGORIES = [
  'Technical Issues',
  'Scope Change',
  'Resource Unavailable',
  'External Dependency',
  'Requirements Clarification',
  'Other'
];

const DelayLog = ({ delays, onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    task_title: '',
    reason: '',
    category: CATEGORIES[0],
    duration: '1 day'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) return;
    
    await onAdd(formData);
    setFormData({ task_title: '', reason: '', category: CATEGORIES[0], duration: '1 day' });
    setShowForm(false);
  };

  return (
    <div className="delay-log">
      {!showForm && (
        <button className="add-delay-btn" onClick={() => setShowForm(true)}>
          <AlertTriangle size={16} /> Log Delay
        </button>
      )}
      
      {showForm && (
        <form className="delay-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Task affected" value={formData.task_title}
            onChange={(e) => setFormData(prev => ({ ...prev, task_title: e.target.value }))} />
          <textarea placeholder="Reason for delay..." value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            rows={2} autoFocus />
          <div className="form-row">
            <select value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input type="text" placeholder="Duration (e.g., 2 days)" value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-save">Log Delay</button>
          </div>
        </form>
      )}
      
      <div className="delays">
        {delays.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">✅</span>
            <span className="empty-state-text">No delays logged</span>
          </div>
        ) : (
          delays.map(delay => (
            <div key={delay.id} className="delay-item">
              <div className="delay-icon"><AlertTriangle size={14} /></div>
              <div className="delay-content">
                {delay.task_title && <span className="delay-task">{delay.task_title}</span>}
                <p className="delay-reason">{delay.reason}</p>
                <div className="delay-meta">
                  <span className="delay-category">{delay.category}</span>
                  <span className="delay-duration">{delay.duration}</span>
                  <span className="delay-time">{format(new Date(delay.created_at), 'MMM d')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DelayLog;
