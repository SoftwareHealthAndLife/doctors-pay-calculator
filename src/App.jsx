import { useState, useCallback } from 'react';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useTasks, useNotes, useActivity, useDelays, useWrikeTasks, useCalendarEvents } from './hooks/useData';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import Panel from './components/Panel';
import TaskList from './components/TaskList';
import NotesList from './components/NotesList';
import ActivityFeed from './components/ActivityFeed';
import CalendarEvents from './components/CalendarEvents';
import WrikeTasks from './components/WrikeTasks';
import DelayLog from './components/DelayLog';
import './App.css';

const Dashboard = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { connections, checkConnections } = useSettings();
  
  const { tasks, loading: tasksLoading, loadTasks, addTask, editTask, removeTask, toggleTaskComplete } = useTasks();
  const { notes, loading: notesLoading, loadNotes, addNote, editNote, removeNote } = useNotes();
  const { activity, loading: activityLoading, loadActivity } = useActivity();
  const { delays, loading: delaysLoading, loadDelays, addDelay } = useDelays();
  const { wrikeTasks, loading: wrikeLoading, loadWrikeTasks } = useWrikeTasks();
  const { events, loading: eventsLoading, loadEvents } = useCalendarEvents();

  const handleRefreshAll = useCallback(async () => {
    await checkConnections();
    if (connections.supabase) {
      loadTasks();
      loadNotes();
      loadActivity();
      loadDelays();
    }
    if (connections.wrike) {
      loadWrikeTasks();
    }
    if (connections.googleCalendar) {
      loadEvents();
    }
  }, [connections, checkConnections, loadTasks, loadNotes, loadActivity, loadDelays, loadWrikeTasks, loadEvents]);

  return (
    <div className="app">
      <div className="bg-pattern"></div>
      
      <Header 
        onOpenSettings={() => setSettingsOpen(true)} 
        onRefresh={handleRefreshAll}
      />
      
      <main className="main-content">
        <div className="dashboard-grid">
          {/* Tasks Panel */}
          <Panel 
            title="Tasks" 
            icon="✅" 
            onRefresh={loadTasks}
            loading={tasksLoading}
          >
            <TaskList 
              tasks={tasks}
              onAdd={addTask}
              onToggle={toggleTaskComplete}
              onEdit={editTask}
              onDelete={removeTask}
            />
          </Panel>

          {/* Notes Panel */}
          <Panel 
            title="Notes" 
            icon="📝" 
            onRefresh={loadNotes}
            loading={notesLoading}
          >
            <NotesList 
              notes={notes}
              onAdd={addNote}
              onEdit={editNote}
              onDelete={removeNote}
            />
          </Panel>

          {/* Wrike Tasks Panel */}
          <Panel 
            title="Wrike Tasks" 
            icon="📋" 
            onRefresh={loadWrikeTasks}
            loading={wrikeLoading}
          >
            {connections.wrike ? (
              <WrikeTasks tasks={wrikeTasks} />
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">🔗</span>
                <span className="empty-state-text">Connect Wrike in Settings</span>
              </div>
            )}
          </Panel>

          {/* Calendar Panel */}
          <Panel 
            title="Calendar" 
            icon="📅" 
            onRefresh={() => loadEvents()}
            loading={eventsLoading}
          >
            {connections.googleCalendar ? (
              <CalendarEvents events={events} />
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">🔗</span>
                <span className="empty-state-text">Connect Google Calendar in Settings</span>
              </div>
            )}
          </Panel>

          {/* Delays Panel */}
          <Panel 
            title="Delay Log" 
            icon="⚠️" 
            onRefresh={loadDelays}
            loading={delaysLoading}
          >
            <DelayLog delays={delays} onAdd={addDelay} />
          </Panel>

          {/* Activity Feed Panel */}
          <Panel 
            title="Activity" 
            icon="📜" 
            onRefresh={loadActivity}
            loading={activityLoading}
          >
            <ActivityFeed activity={activity} />
          </Panel>
        </div>
      </main>

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <Dashboard />
    </SettingsProvider>
  );
};

export default App;
