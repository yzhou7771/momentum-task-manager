// Simple script to verify database setup
// Run with: NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key node verify-db-setup.js
// Or just check your .env.local and set the environment variables

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase environment variables!')
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.log('Check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyTables() {
  console.log('🔍 Verifying database setup...\n')
  
  const tables = [
    'mood_energy_logs',
    'habits', 
    'habit_completions',
    'pomodoro_sessions'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
        if (error.message.includes('does not exist')) {
          console.log(`   → You need to run the Level 2 schema in Supabase SQL Editor`)
        }
      } else {
        console.log(`✅ Table '${table}': Ready`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`)
    }
  }
  
  // Check if energy_type column exists in tasks table
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('energy_type')
      .limit(1)
    
    if (error) {
      console.log(`❌ Column 'tasks.energy_type': ${error.message}`)
      console.log(`   → You need to run the Level 2 schema in Supabase SQL Editor`)
    } else {
      console.log(`✅ Column 'tasks.energy_type': Ready`)
    }
  } catch (err) {
    console.log(`❌ Column 'tasks.energy_type': ${err.message}`)
  }
  
  console.log('\n🔧 If you see errors above, please:')
  console.log('1. Go to your Supabase Dashboard → SQL Editor')
  console.log('2. Copy the contents of supabase/level2-schema.sql')
  console.log('3. Paste and run it in the SQL Editor')
  console.log('4. Run this script again to verify\n')
}