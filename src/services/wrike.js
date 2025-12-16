const WRIKE_API_BASE = 'https://www.wrike.com/api/v4';
const CORS_PROXY = 'https://corsproxy.io/?';

let wrikeToken = null;
let wrikeFolderId = null;

export const initWrike = (token, folderId) => {
  wrikeToken = token;
  wrikeFolderId = folderId;
};

export const getWrikeConfig = () => ({ token: wrikeToken, folderId: wrikeFolderId });

export const testWrikeConnection = async (token) => {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(`${WRIKE_API_BASE}/contacts?me=true`)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Wrike connection test failed:', error);
    return false;
  }
};

export const fetchWrikeTasks = async () => {
  if (!wrikeToken || !wrikeFolderId) return [];
  
  try {
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent(`${WRIKE_API_BASE}/folders/${wrikeFolderId}/tasks?fields=["responsibleIds","description"]`)}`,
      {
        headers: {
          'Authorization': `Bearer ${wrikeToken}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch Wrike tasks');
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Fetch Wrike tasks error:', error);
    return [];
  }
};

export const createWrikeTask = async (title, description = '', assignees = [], dueDate = null) => {
  if (!wrikeToken || !wrikeFolderId) return null;
  
  try {
    const params = new URLSearchParams();
    params.append('title', title);
    if (description) params.append('description', description);
    if (assignees.length > 0) params.append('responsibles', JSON.stringify(assignees));
    if (dueDate) params.append('dates', JSON.stringify({ due: dueDate }));
    
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent(`${WRIKE_API_BASE}/folders/${wrikeFolderId}/tasks`)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wrikeToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );
    
    if (!response.ok) throw new Error('Failed to create Wrike task');
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Create Wrike task error:', error);
    return null;
  }
};

export const updateWrikeTask = async (taskId, updates) => {
  if (!wrikeToken) return null;
  
  try {
    const params = new URLSearchParams();
    if (updates.title) params.append('title', updates.title);
    if (updates.description) params.append('description', updates.description);
    if (updates.status) params.append('status', updates.status);
    if (updates.dueDate) params.append('dates', JSON.stringify({ due: updates.dueDate }));
    
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent(`${WRIKE_API_BASE}/tasks/${taskId}`)}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${wrikeToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );
    
    if (!response.ok) throw new Error('Failed to update Wrike task');
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Update Wrike task error:', error);
    return null;
  }
};

export const addWrikeComment = async (taskId, comment) => {
  if (!wrikeToken) return null;
  
  try {
    const params = new URLSearchParams();
    params.append('text', comment);
    
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent(`${WRIKE_API_BASE}/tasks/${taskId}/comments`)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${wrikeToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );
    
    if (!response.ok) throw new Error('Failed to add Wrike comment');
    
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error('Add Wrike comment error:', error);
    return null;
  }
};

export const fetchWrikeContacts = async () => {
  if (!wrikeToken) return [];
  
  try {
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent(`${WRIKE_API_BASE}/contacts`)}`,
      {
        headers: {
          'Authorization': `Bearer ${wrikeToken}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch Wrike contacts');
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Fetch Wrike contacts error:', error);
    return [];
  }
};
