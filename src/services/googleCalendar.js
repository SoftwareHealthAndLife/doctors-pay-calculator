let gapiInited = false;
let gisInited = false;
let tokenClient = null;
let accessToken = null;
let googleClientId = null;

const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

export const initGoogleCalendar = (clientId) => {
  googleClientId = clientId;
  loadGapiScript();
  loadGisScript();
};

const loadGapiScript = () => {
  if (document.getElementById('gapi-script')) return;
  
  const script = document.createElement('script');
  script.id = 'gapi-script';
  script.src = 'https://apis.google.com/js/api.js';
  script.onload = () => {
    window.gapi.load('client', initializeGapiClient);
  };
  document.body.appendChild(script);
};

const loadGisScript = () => {
  if (document.getElementById('gis-script')) return;
  
  const script = document.createElement('script');
  script.id = 'gis-script';
  script.src = 'https://accounts.google.com/gsi/client';
  script.onload = () => {
    initializeGisClient();
  };
  document.body.appendChild(script);
};

const initializeGapiClient = async () => {
  try {
    await window.gapi.client.init({
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
  } catch (error) {
    console.error('GAPI init error:', error);
  }
};

const initializeGisClient = () => {
  if (!googleClientId) return;
  
  try {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          accessToken = response.access_token;
        }
      },
    });
    gisInited = true;
  } catch (error) {
    console.error('GIS init error:', error);
  }
};

export const isGoogleCalendarReady = () => gapiInited && gisInited && googleClientId;

export const authorizeGoogleCalendar = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google Calendar not initialized'));
      return;
    }
    
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(response);
      } else {
        accessToken = response.access_token;
        resolve(response);
      }
    };
    
    if (accessToken === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const testGoogleCalendarConnection = async () => {
  if (!accessToken) return false;
  
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    return response.ok;
  } catch {
    return false;
  }
};

export const fetchCalendarEvents = async (timeMin, timeMax) => {
  if (!accessToken) return [];
  
  const now = new Date();
  const defaultTimeMin = timeMin || now.toISOString();
  const defaultTimeMax = timeMax || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  try {
    const params = new URLSearchParams({
      timeMin: defaultTimeMin,
      timeMax: defaultTimeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50'
    });
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch calendar events');
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Fetch calendar events error:', error);
    return [];
  }
};

export const createCalendarEvent = async (summary, description, startDateTime, endDateTime, attendees = []) => {
  if (!accessToken) return null;
  
  try {
    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: 'Australia/Adelaide'
      },
      end: {
        dateTime: endDateTime || new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'Australia/Adelaide'
      },
      attendees: attendees.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };
    
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    );
    
    if (!response.ok) throw new Error('Failed to create calendar event');
    
    return await response.json();
  } catch (error) {
    console.error('Create calendar event error:', error);
    return null;
  }
};

export const updateCalendarEvent = async (eventId, updates) => {
  if (!accessToken) return null;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    );
    
    if (!response.ok) throw new Error('Failed to update calendar event');
    
    return await response.json();
  } catch (error) {
    console.error('Update calendar event error:', error);
    return null;
  }
};

export const deleteCalendarEvent = async (eventId) => {
  if (!accessToken) return false;
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    return response.ok || response.status === 204;
  } catch (error) {
    console.error('Delete calendar event error:', error);
    return false;
  }
};
