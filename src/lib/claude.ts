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
    const response = await fetch('/api/tasks/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const analysis: TaskAnalysis = await response.json()
    return analysis
  } catch (error) {
    console.error('Task analysis API error:', error)
    
    // Fallback: simple task extraction
    const tasks = input.split(/[,\n]/).map((task, index) => ({
      title: task.trim(),
      priority: 5,
      timeEstimate: 30,
      tags: []
    })).filter(task => task.title.length > 0)

    return {
      tasks,
      summary: `Extracted ${tasks.length} tasks from input (fallback mode)`
    }
  }
}