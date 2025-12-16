# Doctors' Pay Calculator - React Dashboard

A modern React 19 project management dashboard with real-time integrations for Supabase, Wrike, Google Calendar, and Google Chat.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | Frontend framework |
| Vite | Build tool |
| Supabase | Real-time database |
| Wrike API | Project management |
| Google Calendar API | Event scheduling |
| Google Chat Webhooks | Team notifications |
| Lucide React | Icons |
| date-fns | Date formatting |

## Features

- ✅ **Task Management** - Create, edit, complete tasks with sync to Wrike
- 📝 **Notes** - Collaborative notes with real-time sync
- 📋 **Wrike Integration** - View and sync tasks with Wrike project
- 📅 **Google Calendar** - View upcoming events, create deadlines
- 💬 **Google Chat** - Automatic notifications for task changes
- ⚠️ **Delay Logging** - Track project delays with categorization
- 📜 **Activity Feed** - Real-time activity log

## Setup

### Quick Setup with Cursor

| Step | Action |
|------|--------|
| 1 | Download Cursor from [cursor.com](https://cursor.com) |
| 2 | Extract the `doctors-pay-react.zip` |
| 3 | Open Cursor → **File → Open Folder** → select the extracted folder |
| 4 | Open terminal in Cursor: **Ctrl + `** (backtick) |
| 5 | Run `npm install` then `npm run dev` |
| 6 | Open `http://localhost:5173` in your browser |

### Manual Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Run Development Server

```bash
npm run dev
```

### 3. Configure Integrations

Open the dashboard and click **⚙️ Settings** to configure:

| Integration | Required Credentials |
|-------------|---------------------|
| Supabase | Project URL + Anon Key |
| Wrike | API Token + Folder ID |
| Google Calendar | OAuth Client ID |
| Google Chat | Webhook URL |

## Deployment

### GitHub Pages (Automatic)

Push to `main` branch - GitHub Actions will build and deploy automatically.

### Manual Build

```bash
npm run build
```

Output will be in the `dist/` folder.

## Supabase Schema

Run this SQL in your Supabase project:

```sql
-- Tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  assignee TEXT,
  due_date TIMESTAMPTZ,
  wrike_id TEXT,
  calendar_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  wrike_task_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity table
CREATE TABLE activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  source TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delays table
CREATE TABLE delays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_title TEXT,
  reason TEXT NOT NULL,
  category TEXT NOT NULL,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tasks, notes, activity;
```

## Project Links

- **Live Dashboard**: https://softwarehealthandlife.github.io/doctors-pay-calculator/
- **Supabase Project**: https://supabase.com/dashboard/project/ogvwqibfpvgdlqzyvyrk
- **Wrike Folder**: https://www.wrike.com/open.htm?id=4333116655
- **GitHub Repo**: https://github.com/SoftwareHealthAndLife/doctors-pay-calculator

## License

MIT
