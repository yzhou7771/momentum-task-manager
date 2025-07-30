// 创建管理员账号的脚本
// 运行: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createAdmin() {
  try {
    console.log('Creating admin user...')
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@momentum.local',
      password: 'momentum123',
      user_metadata: {
        name: 'Admin User'
      },
      email_confirm: true
    })

    if (error) {
      console.error('Error creating admin user:', error)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@momentum.local')
    console.log('🔑 Password: momentum123')
    console.log('👤 Name: Admin User')
    console.log('')
    console.log('You can now sign in with these credentials at http://localhost:3000')

  } catch (error) {
    console.error('Script error:', error)
  }
}

createAdmin()