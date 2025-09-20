import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Check if environment variables are set
    const hasSupabaseUrl = !!process.env.SUPABASE_URL
    const hasSupabaseAnon = !!process.env.SUPABASE_ANON_KEY
    const hasSupabaseService = !!process.env.SUPABASE_SERVICE_ROLE
    
    let dbConnection = false
    let dbError = null
    
    // Try to connect to Supabase if credentials exist
    if (hasSupabaseUrl && hasSupabaseAnon) {
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_ANON_KEY!
        )
        
        // Simple test query
        const { error } = await supabase.from('profiles').select('count').limit(1)
        
        if (!error) {
          dbConnection = true
        } else {
          dbError = error.message
        }
      } catch (e: any) {
        dbError = e.message
      }
    }
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        SUPABASE_URL: hasSupabaseUrl ? 'configured' : 'missing',
        SUPABASE_ANON_KEY: hasSupabaseAnon ? 'configured' : 'missing',
        SUPABASE_SERVICE_ROLE: hasSupabaseService ? 'configured' : 'missing',
      },
      database: {
        connected: dbConnection,
        error: dbError
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
}