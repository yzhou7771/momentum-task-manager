import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface TaskAnalysis {
  tasks: Array<{
    title: string
    description?: string
    priority: number
    timeEstimate?: number
    tags?: string[]
    energyType?: 'creative' | 'administrative' | 'physical' | 'social'
  }>
  summary: string
}

export async function POST(request: NextRequest) {
  const requestBody = await request.json()
  const input = requestBody.input

  if (!input || typeof input !== 'string') {
    return NextResponse.json(
      { error: 'Invalid input provided' },
      { status: 400 }
    )
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Analyze this task input and extract individual tasks with priorities, estimates, and energy types. Return JSON only:

Input: "${input}"

Response format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Optional description",
      "priority": 1-10,
      "timeEstimate": 30,
      "tags": ["tag1", "tag2"],
      "energyType": "creative|administrative|physical|social"
    }
  ],
  "summary": "Brief summary of what was processed"
}

Prioritize based on urgency/importance. Estimate time in minutes. Extract relevant tags.
Classify energy type as:
- creative: Design, writing, brainstorming, innovation, artistic work
- administrative: Email, scheduling, documentation, data entry, organizing
- physical: Exercise, cleaning, errands, moving things, manual tasks
- social: Meetings, calls, networking, collaboration, presentations`
        }
      ]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      const analysis: TaskAnalysis = JSON.parse(content.text)
      return NextResponse.json(analysis)
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Claude API error:', error)
    
    // Fallback: simple task extraction using the input we already have
    const fallbackTasks = input.split(/[,\n]/).map((task: string) => ({
      title: task.trim(),
      priority: 5,
      timeEstimate: 30,
      tags: [],
      energyType: 'administrative' as const
    })).filter((task: any) => task.title.length > 0)

    const fallbackAnalysis: TaskAnalysis = {
      tasks: fallbackTasks,
      summary: `Extracted ${fallbackTasks.length} tasks from input (fallback mode - Claude API unavailable)`
    }

    console.log('Using fallback analysis:', fallbackAnalysis)
    return NextResponse.json(fallbackAnalysis)
  }
}