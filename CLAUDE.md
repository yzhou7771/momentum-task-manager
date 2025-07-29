# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vision:** A smart, adaptive task manager that prioritizes your to-dos based on how you actually feel — not how you should feel.

**Target Audience:** Freelancers, entrepreneurs, and students who want to maximize productivity and reduce the friction of task management.

**Core Differentiator:** Unlike traditional task managers that treat all tasks equally, Momentum understands that productivity isn't linear and adapts to your natural energy rhythms with voice-first input and intelligent, context-aware prioritization.

## Technology Stack

- **Frontend**: React/Next.js with Tailwind CSS
- **Backend**: Supabase (authentication + PostgreSQL database)
- **AI Integration**: Claude API for task processing and categorization
- **Voice Input**: Web Speech API
- **Deployment**: Vercel/Netlify (web-first approach for rapid iteration)

## Core Architecture Concepts

### User Journey & Data Flow
1. **Morning Ritual**: User receives morning notification, opens web app, plans day by dumping tasks via text or voice
2. **AI Processing**: Claude API categorizes and prioritizes tasks into smart list based on energy type, urgency, and other factors
3. **Personalization**: Users optionally log mood/energy levels for better AI suggestions
4. **Daily Workflow**: Dashboard displays reorganized, energy-aware to-do list with helpful nudges; tasks move from inbox to active
5. **Future Enhancement**: Health data integration (sleep, steps) for smarter, context-aware suggestions

### Key Data Models

**Level 1 (MVP) Task Properties:**
- Title, description, priority level, time estimate
- Status (inbox/active/completed), categories/tags
- Created date, completed date

**User Data:**
- User profiles (name, preferences, notification settings)
- Tasks and task history, voice transcriptions
- Basic productivity stats

**Level 2+ Extensions:**
- Energy/mood logs for pattern analysis
- Health data integration points
- Advanced analytics and productivity insights

### Energy-Aware Task System
The core differentiator is matching tasks to user energy levels:
- **Creative**: Design work, brainstorming, writing
- **Administrative**: Email, scheduling, data entry
- **Physical**: Exercise, cleaning, errands  
- **Social**: Meetings, calls, networking

## Development Commands

When the codebase is established, common commands will likely include:

```bash
# Development server
npm run dev

# Build for production  
npm run build

# Run tests
npm test

# Database migrations (Supabase)
npx supabase db push

# Type checking
npm run type-check

# Linting
npm run lint
```

## Key Integration Points

### Claude API Integration
- Task extraction and categorization from natural language input
- Priority scoring based on urgency/importance indicators
- Energy-type classification for optimal scheduling
- Handle API failures gracefully with fallback categorization

### Supabase Integration
- Row Level Security (RLS) policies for user data isolation
- Real-time subscriptions for task updates
- Auth integration with session management
- Database schema follows PRD specifications

### Voice Input Processing
- Web Speech API for voice-to-text conversion
- Handle multiple tasks in single voice input
- Fallback to text input when voice unavailable
- Real-time transcription feedback

## UI/UX Design Principles

**Visual Direction:** Warm and gamified — think Headspace meets Todoist

**Key Design Elements:**
- **Mobile-responsive design essential** (web-first approach)
- **Voice-first interaction model** for task input with progressive enhancement
- **Encouraging, friendly interface** with progress celebrations and streaks
- **Gentle nudges and motivational messaging** (no guilt-inducing patterns)
- **Warm color palette** (earth tones, calming blues/greens)
- **Rounded corners and soft shadows** with delightful micro-interactions
- **Clear visual hierarchy** with accessibility-first approach (WCAG 2.1 AA)
- **Progressive Web App (PWA)** capabilities for mobile app-like experience

## Development Phases

### Level 1 (MVP)
**Core Functionality:**
- User authentication and accounts (Supabase)
- Smart task list with AI-powered organization and priority suggestions (Claude API)
- Voice input for brain dumping (Web Speech API) with text input option
- Inbox → Active task workflow
- Morning planning notifications
- Basic progress dashboard
- User preferences and settings

### Level 2
**Energy & Mood Features:**
- Mood/energy check-ins and logging
- Health data integration (Apple Health, etc.)
- AI suggestions based on energy levels and patterns
- Energy-aware task recommendations
- Pattern analysis over time

**Productivity Tools:**
- Pomodoro timer integration
- Habit tracking
- Advanced analytics dashboard
- Productivity insights and trends

### Level 3
**Advanced Features:**
- Calendar integration
- Real-time AI conversations/coaching
- Task templates library
- Recurring tasks with smart scheduling
- API integrations (Notion, Slack, etc.)
- Potential team/collaboration features

## Security Considerations

- All user data encrypted in transit (TLS 1.3) and at rest (AES-256)
- Rate limiting on API endpoints (100 requests/minute per user) and AI requests
- Supabase RLS policies prevent cross-user data access
- Secure API key management for Claude API integration
- GDPR/CCPA compliance for data handling
- Regular security audits planned

## Performance Requirements

- Page load time <2 seconds on 3G networks
- Voice transcription processing <3 seconds  
- AI task processing <5 seconds for up to 20 tasks
- 99.9% uptime target with auto-scaling infrastructure
- Real-time updates not required for MVP (web-first approach)

## Success Metrics

**Level 1 Success Indicators:**
- User retention (daily active users)
- Task completion rate
- Voice input usage rate
- User feedback on AI prioritization accuracy

**Level 2 Success Indicators:**
- Correlation between mood/energy logging and productivity
- Improvement in task completion when using energy-aware suggestions
- User engagement with health integrations

**Level 3 Success Indicators:**
- Cross-platform usage patterns
- AI coaching session effectiveness
- Integration adoption rates

## Technical Considerations

**Key Implementation Notes:**
- Web-first approach for rapid iteration
- Mobile-responsive design essential
- Progressive enhancement for voice features
- Real-time updates not required for MVP
- Focus on inbox → active task workflow
- Morning planning notifications as core engagement driver