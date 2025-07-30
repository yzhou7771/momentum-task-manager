import { supabase, Task, MoodEnergyLog } from './supabase'

export interface TaskRecommendation {
  task: Task
  score: number
  reason: string
  energyMatch: boolean
}

export interface EnergyProfile {
  currentEnergy: 'low' | 'medium' | 'high'
  currentMood: 'frustrated' | 'tired' | 'neutral' | 'focused' | 'energetic' | 'creative'
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  recentPatterns: MoodEnergyLog[]
}

/**
 * Get energy-aware task recommendations
 */
export async function getEnergyAwareRecommendations(
  tasks: Task[],
  energyProfile?: EnergyProfile
): Promise<TaskRecommendation[]> {
  // If no energy profile, return basic priority-based recommendations
  if (!energyProfile) {
    return tasks
      .filter(task => task.status === 'inbox')
      .map(task => ({
        task,
        score: task.priority * 10,
        reason: `Priority ${task.priority}/10`,
        energyMatch: false
      }))
      .sort((a, b) => b.score - a.score)
  }

  const recommendations: TaskRecommendation[] = []

  for (const task of tasks.filter(t => t.status === 'inbox')) {
    let score = task.priority * 10 // Base score from priority
    let reason = `Priority ${task.priority}/10`
    let energyMatch = false

    // Energy type matching
    if (task.energy_type) {
      const energyBonus = calculateEnergyBonus(
        task.energy_type,
        energyProfile.currentEnergy,
        energyProfile.currentMood
      )
      
      if (energyBonus > 0) {
        score += energyBonus
        energyMatch = true
        reason = getEnergyMatchReason(
          task.energy_type,
          energyProfile.currentEnergy,
          energyProfile.currentMood
        )
      }
    }

    // Time-based adjustments
    score += getTimeOfDayBonus(task, energyProfile.timeOfDay)

    // Duration matching with energy level
    if (task.time_estimate) {
      score += getDurationEnergyBonus(task.time_estimate, energyProfile.currentEnergy)
    }

    // Mood-based filtering (avoid certain tasks when frustrated/tired)
    if (shouldAvoidTask(task, energyProfile.currentMood)) {
      score *= 0.5 // Reduce score significantly
      reason += ' (Not ideal for current mood)'
    }

    recommendations.push({
      task,
      score,
      reason,
      energyMatch
    })
  }

  return recommendations.sort((a, b) => b.score - a.score)
}

/**
 * Calculate bonus score based on energy type matching
 */
function calculateEnergyBonus(
  taskEnergyType: string,
  currentEnergy: string,
  currentMood: string
): number {
  const energyMatches: Record<string, Record<string, number>> = {
    creative: {
      high: 40,
      medium: 20,
      low: 5
    },
    administrative: {
      high: 15,
      medium: 30,
      low: 25
    },
    physical: {
      high: 35,
      medium: 20,
      low: 5
    },
    social: {
      high: 30,
      medium: 25,
      low: 10
    }
  }

  const moodBonuses: Record<string, Record<string, number>> = {
    creative: {
      creative: 20,
      focused: 15,
      energetic: 10,
      neutral: 0,
      tired: -10,
      frustrated: -15
    },
    administrative: {
      focused: 20,
      neutral: 15,
      tired: 5,
      energetic: 0,
      creative: -5,
      frustrated: -20
    },
    physical: {
      energetic: 20,
      focused: 10,
      neutral: 5,
      creative: 0,
      tired: -15,
      frustrated: -10
    },
    social: {
      energetic: 20,
      creative: 15,
      focused: 10,
      neutral: 5,
      tired: -10,
      frustrated: -20
    }
  }

  let bonus = energyMatches[taskEnergyType]?.[currentEnergy] || 0
  bonus += moodBonuses[taskEnergyType]?.[currentMood] || 0

  return Math.max(0, bonus)
}

/**
 * Get human-readable reason for energy match
 */
function getEnergyMatchReason(
  taskEnergyType: string,
  currentEnergy: string,
  currentMood: string
): string {
  const reasons: Record<string, Record<string, string>> = {
    creative: {
      high: 'Perfect for creative work with high energy',
      medium: 'Good creative opportunity',
      low: 'Light creative task for low energy'
    },
    administrative: {
      high: 'Good admin work while energetic',
      medium: 'Ideal for focused admin tasks',
      low: 'Simple admin task for current energy'
    },
    physical: {
      high: 'Great time for physical tasks',
      medium: 'Moderate physical activity',
      low: 'Light physical task'
    },
    social: {
      high: 'Perfect energy for social interaction',
      medium: 'Good for social tasks',
      low: 'Brief social interaction'
    }
  }

  const moodEnhancements: Record<string, string> = {
    creative: ', feeling creative',
    focused: ', while focused',
    energetic: ', with high energy',
    frustrated: ', despite frustration',
    tired: ', even when tired'
  }

  let reason = reasons[taskEnergyType]?.[currentEnergy] || 'Energy-matched task'
  if (moodEnhancements[currentMood]) {
    reason += moodEnhancements[currentMood]
  }

  return reason
}

/**
 * Time of day bonus for certain task types
 */
function getTimeOfDayBonus(task: Task, timeOfDay: string): number {
  const timePreferences: Record<string, Record<string, number>> = {
    creative: {
      morning: 15,
      afternoon: 5,
      evening: 10
    },
    administrative: {
      morning: 10,
      afternoon: 15,
      evening: 5
    },
    physical: {
      morning: 20,
      afternoon: 10,
      evening: 5
    },
    social: {
      morning: 5,
      afternoon: 15,
      evening: 10
    }
  }

  if (!task.energy_type) return 0
  return timePreferences[task.energy_type]?.[timeOfDay] || 0
}

/**
 * Duration-energy bonus
 */
function getDurationEnergyBonus(duration: number, energyLevel: string): number {
  if (energyLevel === 'high' && duration <= 30) return 10 // Quick wins with high energy
  if (energyLevel === 'medium' && duration > 15 && duration <= 60) return 10 // Moderate tasks
  if (energyLevel === 'low' && duration <= 15) return 15 // Short tasks for low energy
  if (energyLevel === 'low' && duration > 60) return -20 // Avoid long tasks when low energy
  
  return 0
}

/**
 * Check if task should be avoided based on mood
 */
function shouldAvoidTask(task: Task, mood: string): boolean {
  const avoidanceRules: Record<string, string[]> = {
    frustrated: ['social'], // Avoid social tasks when frustrated
    tired: ['creative', 'physical'], // Avoid demanding tasks when tired
  }

  return task.energy_type ? avoidanceRules[mood]?.includes(task.energy_type) : false
}

/**
 * Get current energy profile
 */
export async function getCurrentEnergyProfile(): Promise<EnergyProfile | null> {
  try {
    // Get most recent mood/energy log from today
    const today = new Date().toISOString().split('T')[0]
    const { data: recentLog, error } = await supabase
      .from('mood_energy_logs')
      .select('*')
      .gte('logged_at', `${today}T00:00:00.000Z`)
      .order('logged_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    if (!recentLog) return null

    // Get recent patterns (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const { data: recentPatterns, error: patternsError } = await supabase
      .from('mood_energy_logs')
      .select('*')
      .gte('logged_at', weekAgo.toISOString())
      .order('logged_at', { ascending: false })

    if (patternsError) throw patternsError

    // Determine time of day
    const hour = new Date().getHours()
    let timeOfDay: 'morning' | 'afternoon' | 'evening'
    if (hour < 12) timeOfDay = 'morning'
    else if (hour < 17) timeOfDay = 'afternoon'
    else timeOfDay = 'evening'

    return {
      currentEnergy: recentLog.energy_level,
      currentMood: recentLog.mood,
      timeOfDay,
      recentPatterns: recentPatterns || []
    }
  } catch (error) {
    console.error('Failed to get current energy profile:', error)
    return null
  }
}

/**
 * Analyze energy patterns and suggest optimal times for task types
 */
export function analyzeEnergyPatterns(logs: MoodEnergyLog[]): {
  bestTimesForCreative: string[]
  bestTimesForAdmin: string[]
  commonEnergyDips: string[]
  recommendations: string[]
} {
  if (logs.length < 3) {
    return {
      bestTimesForCreative: [],
      bestTimesForAdmin: [],
      commonEnergyDips: [],
      recommendations: ['Log more mood/energy data to get personalized insights']
    }
  }

  // Group logs by hour of day
  const hourlyData: Record<number, { energy: string[], mood: string[] }> = {}
  
  logs.forEach(log => {
    const hour = new Date(log.logged_at).getHours()
    if (!hourlyData[hour]) {
      hourlyData[hour] = { energy: [], mood: [] }
    }
    hourlyData[hour].energy.push(log.energy_level)
    hourlyData[hour].mood.push(log.mood)
  })

  // Find patterns
  const highEnergyHours: number[] = []
  const lowEnergyHours: number[] = []
  const creativeHours: number[] = []

  Object.entries(hourlyData).forEach(([hour, data]) => {
    const hourNum = parseInt(hour)
    const avgEnergy = data.energy.filter(e => e === 'high').length / data.energy.length
    const creativeCount = data.mood.filter(m => m === 'creative').length
    
    if (avgEnergy > 0.6) highEnergyHours.push(hourNum)
    if (avgEnergy < 0.3) lowEnergyHours.push(hourNum)
    if (creativeCount > 0) creativeHours.push(hourNum)
  })

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}${period}`
  }

  return {
    bestTimesForCreative: creativeHours.map(formatHour),
    bestTimesForAdmin: highEnergyHours.filter(h => !creativeHours.includes(h)).map(formatHour),
    commonEnergyDips: lowEnergyHours.map(formatHour),
    recommendations: [
      highEnergyHours.length ? `You tend to have high energy around ${highEnergyHours.map(formatHour).join(', ')}` : '',
      creativeHours.length ? `Your creative peak times are around ${creativeHours.map(formatHour).join(', ')}` : '',
      lowEnergyHours.length ? `Energy typically dips around ${lowEnergyHours.map(formatHour).join(', ')} - good time for simple tasks` : ''
    ].filter(Boolean)
  }
}