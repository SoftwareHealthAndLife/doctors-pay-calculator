import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import './CalendarEvents.css';

const CalendarEvents = ({ events }) => {
  const getEventStatus = (event) => {
    const start = new Date(event.start?.dateTime || event.start?.date);
    if (isPast(start)) return 'past';
    if (isToday(start)) return 'today';
    if (isTomorrow(start)) return 'tomorrow';
    return 'upcoming';
  };

  const formatEventTime = (event) => {
    const start = event.start?.dateTime || event.start?.date;
    const end = event.end?.dateTime || event.end?.date;
    
    if (!start) return '';
    
    const startDate = new Date(start);
    
    if (event.start?.date && !event.start?.dateTime) {
      return format(startDate, 'MMM d');
    }
    
    return format(startDate, 'MMM d, h:mm a');
  };

  return (
    <div className="calendar-events">
      {events.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📅</span>
          <span className="empty-state-text">No upcoming events</span>
        </div>
      ) : (
        events.map(event => (
          <div key={event.id} className={`event-item ${getEventStatus(event)}`}>
            <div className="event-indicator"></div>
            <div className="event-content">
              <span className="event-title">{event.summary}</span>
              <div className="event-meta">
                <span className="event-time">
                  <Clock size={12} />
                  {formatEventTime(event)}
                </span>
                {event.location && (
                  <span className="event-location">
                    <MapPin size={12} />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CalendarEvents;
