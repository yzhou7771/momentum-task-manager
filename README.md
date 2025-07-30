# Momentum - Smart Task Manager 🚀

A smart, adaptive task manager that prioritizes your to-dos based on how you actually feel — not how you should feel.

## Features

### ✨ MVP Features (Level 1)
- **Smart Task Management**: AI-powered task categorization and prioritization using Claude API
- **Voice Input**: Speak your tasks naturally using Web Speech API
- **Intelligent Organization**: Inbox → Active → Completed workflow
- **User Authentication**: Secure authentication with Supabase Auth
- **Morning Notifications**: Daily planning reminders
- **Progress Tracking**: Visual progress dashboard with completion rates
- **Responsive Design**: Mobile-first, warm and gamified interface

### 🎯 Core Differentiators
- Understands that productivity isn't linear
- Adapts to your natural energy rhythms
- Voice-first input reduces friction
- AI provides intelligent, context-aware prioritization
- Celebrates progress without inducing guilt

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI Processing**: Claude API (Anthropic)
- **Voice Input**: Web Speech API
- **Deployment**: Vercel/Netlify ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Anthropic API key

### 1. Clone and Install
```bash
git clone <repository-url>
cd momentum
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API Configuration  
ANTHROPIC_API_KEY=your_anthropic_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Ensure Row Level Security (RLS) is enabled

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   ├── notifications/     # Notification components
│   ├── settings/          # Settings components
│   ├── tasks/             # Task management components
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
└── lib/                   # Utility libraries
    ├── auth.ts            # Authentication service
    ├── claude.ts          # Claude AI integration
    ├── notifications.ts   # Notification service
    ├── supabase.ts        # Supabase client
    ├── tasks.ts           # Task service
    └── utils.ts           # Utility functions
```

## Key Features Implementation

### 🎤 Voice Input
- Uses Web Speech API for natural language task input
- Fallback to text input when voice is unavailable
- Real-time transcription feedback

### 🤖 AI Task Processing
- Claude API analyzes natural language input
- Extracts multiple tasks from single input
- Automatically assigns priorities and time estimates
- Intelligent tagging and categorization

### 📱 Responsive Design
- Mobile-first responsive design
- Warm color palette (earth tones, calming blues/greens)
- Gentle animations and micro-interactions
- Accessibility-first approach (WCAG 2.1 AA)

### 🔐 Security
- Row Level Security (RLS) policies
- Encrypted data (TLS 1.3 in transit, AES-256 at rest)
- Secure API key management
- Rate limiting on AI requests

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Start production server
npm start
```

## API Integration

### Claude API
The app uses Claude API for intelligent task processing:
- Natural language parsing
- Task extraction and categorization
- Priority assignment
- Time estimation

### Supabase
- User authentication and management
- Real-time data storage
- Row Level Security for data isolation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Roadmap

### Level 2 Features
- Energy/mood tracking and logging
- Health data integration (Apple Health, etc.)
- AI suggestions based on energy patterns
- Pomodoro timer integration
- Advanced analytics dashboard

### Level 3 Features  
- Calendar integration
- Real-time AI coaching
- Task templates library
- API integrations (Notion, Slack)
- Team collaboration features

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.