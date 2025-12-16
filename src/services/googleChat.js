let chatWebhookUrl = null;

export const initGoogleChat = (webhookUrl) => {
  chatWebhookUrl = webhookUrl;
};

export const getGoogleChatConfig = () => ({ webhookUrl: chatWebhookUrl });

export const testGoogleChatConnection = async (webhookUrl) => {
  // We can't really test without sending a message
  // Just validate the URL format
  try {
    const url = new URL(webhookUrl);
    return url.hostname === 'chat.googleapis.com';
  } catch {
    return false;
  }
};

export const sendChatMessage = async (text, cardHeader = null) => {
  if (!chatWebhookUrl) return null;
  
  try {
    let body;
    
    if (cardHeader) {
      // Send as card
      body = {
        cardsV2: [{
          cardId: `card-${Date.now()}`,
          card: {
            header: {
              title: cardHeader.title,
              subtitle: cardHeader.subtitle,
              imageUrl: cardHeader.imageUrl || 'https://www.gstatic.com/images/icons/material/system/2x/description_grey600_48dp.png',
              imageType: 'CIRCLE'
            },
            sections: [{
              widgets: [{
                textParagraph: { text }
              }]
            }]
          }
        }]
      };
    } else {
      // Send as simple text
      body = { text };
    }
    
    const response = await fetch(chatWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) throw new Error('Failed to send chat message');
    
    return await response.json();
  } catch (error) {
    console.error('Send chat message error:', error);
    return null;
  }
};

export const sendTaskNotification = async (action, taskTitle, assignee = null) => {
  const emoji = {
    created: '✅',
    updated: '📝',
    completed: '🎉',
    deleted: '🗑️'
  };
  
  let text = `${emoji[action] || '📋'} *Task ${action}*: ${taskTitle}`;
  if (assignee) {
    text += `\n👤 Assigned to: ${assignee}`;
  }
  
  return sendChatMessage(text, {
    title: `Task ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    subtitle: 'Doctors Pay Calculator Project'
  });
};

export const sendDelayNotification = async (taskTitle, reason, category, duration) => {
  const text = `⚠️ *Delay Logged*\n📋 Task: ${taskTitle}\n📂 Category: ${category}\n⏱️ Duration: ${duration}\n💬 Reason: ${reason}`;
  
  return sendChatMessage(text, {
    title: 'Delay Alert',
    subtitle: 'Doctors Pay Calculator Project'
  });
};
