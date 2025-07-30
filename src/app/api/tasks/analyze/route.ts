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
  }>
  summary: string
}

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input provided' },
        { status: 400 }
      )
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Analyze this task input and extract individual tasks with priorities and estimates. Return JSON only:

Input: "${input}"

Response format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Optional description",
      "priority": 1-10,
      "timeEstimate": 30,
      "tags": ["tag1", "tag2"]
    }
  ],
  "summary": "Brief summary of what was processed"
}

Prioritize based on urgency/importance. Estimate time in minutes. Extract relevant tags.`
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
    
    // Fallback: simple task extraction
    // 我们已经解析了request.json()，所以需要重新获取input
    const fallbackTasks = input.split(/[,\n]/).map((task: string, index: number) => ({
      title: task.trim(),
      priority: 5,
      timeEstimate: 30,
      tags: []
    })).filter((task: any) => task.title.length > 0)

    const fallbackAnalysis: TaskAnalysis = {
      tasks: fallbackTasks,
      summary: `Extracted ${fallbackTasks.length} tasks from input (fallback mode - Claude API unavailable)`
    }

    console.log('Using fallback analysis:', fallbackAnalysis)
    return NextResponse.json(fallbackAnalysis)
  }
}