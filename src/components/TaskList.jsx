import { useState } from 'react';
import { Check, Circle, Edit2, Trash2, Plus, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import './TaskList.css';

const TaskList = ({ tasks, onAdd, onToggle, onEdit, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    due_date: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    if (editingId) {
      await onEdit(editingId, formData);
      setEditingId(null);
    } else {
      await onAdd(formData);
    }
    
    setFormData({ title: '', description: '', assignee: '', due_date: '', status: 'active' });
    setShowForm(false);
  };

  const startEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      assignee: task.assignee || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setFormData({ title: '', description: '', assignee: '', due_date: '', status: 'active' });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'in_progress': return 'status-progress';
      default: return 'status-active';
    }
  };

  return (
    <div className="task-list">
      {!showForm && (
        <button className="add-task-btn" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Add Task
        </button>
      )}
      
      {showForm && (
        <form className="task-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task title..."
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
          <div className="form-row">
            <input
              type="text"
              placeholder="Assignee"
              value={formData.assignee}
              onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
            />
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={cancelEdit}>
              Cancel
            </button>
            <button type="submit" className="btn btn-save">
              {editingId ? 'Update' : 'Add'} Task
            </button>
          </div>
        </form>
      )}
      
      <div className="tasks">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📋</span>
            <span className="empty-state-text">No tasks yet</span>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
            >
              <button 
                className="task-check"
                onClick={() => onToggle(task.id)}
              >
                {task.status === 'completed' ? (
                  <Check size={16} />
                ) : (
                  <Circle size={16} />
                )}
              </button>
              
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                {task.description && (
                  <span className="task-description">{task.description}</span>
                )}
                <div className="task-meta">
                  {task.assignee && (
                    <span className="task-assignee">
                      <User size={12} />
                      {task.assignee}
                    </span>
                  )}
                  {task.due_date && (
                    <span className="task-due">
                      <Calendar size={12} />
                      {format(new Date(task.due_date), 'MMM d')}
                    </span>
                  )}
                  <span className={`task-status ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
              
              <div className="task-actions">
                <button 
                  className="btn-icon-tiny"
                  onClick={() => startEdit(task)}
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  className="btn-icon-tiny delete"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
