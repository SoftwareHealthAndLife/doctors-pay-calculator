import { useState } from 'react';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import './NotesList.css';

const NotesList = ({ notes, onAdd, onEdit, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;
    
    if (editingId) {
      await onEdit(editingId, formData);
      setEditingId(null);
    } else {
      await onAdd({ ...formData, title: formData.title || 'Untitled Note' });
    }
    setFormData({ title: '', content: '' });
    setShowForm(false);
  };

  const startEdit = (note) => {
    setFormData({ title: note.title || '', content: note.content || '' });
    setEditingId(note.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setFormData({ title: '', content: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="notes-list">
      {!showForm && (
        <button className="add-note-btn" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Note
        </button>
      )}
      
      {showForm && (
        <form className="note-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Note title (optional)" value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
          <textarea placeholder="Write your note..." value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={4} autoFocus />
          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={cancelEdit}>
              <X size={14} /> Cancel
            </button>
            <button type="submit" className="btn btn-save">
              <Save size={14} /> {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}
      
      <div className="notes">
        {notes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📝</span>
            <span className="empty-state-text">No notes yet</span>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-item">
              <div className="note-content">
                {note.title && <span className="note-title">{note.title}</span>}
                <p className="note-text">{note.content}</p>
                <span className="note-time">
                  {format(new Date(note.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="note-actions">
                <button className="btn-icon-tiny" onClick={() => startEdit(note)}>
                  <Edit2 size={14} />
                </button>
                <button className="btn-icon-tiny delete" onClick={() => onDelete(note.id)}>
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

export default NotesList;
