import Anthropic from '@anthropic-ai/sdk'

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

export async function analyzeTaskInput(input: string): Promise<TaskAnalysis> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
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
      return JSON.parse(content.text)
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Claude API error:', error)
    
    // Fallback: simple task extraction
    const tasks = input.split(/[,\n]/).map((task, index) => ({
      title: task.trim(),
      priority: 5,
      timeEstimate: 30,
      tags: []
    })).filter(task => task.title.length > 0)

    return {
      tasks,
      summary: `Extracted ${tasks.length} tasks from input`
    }
  }
}