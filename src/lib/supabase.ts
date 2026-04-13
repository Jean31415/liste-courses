import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const SUPABASE_URL = 'https://bdafvcyjsljzgxdqcdnl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYWZ2Y3lqc2xqemd4ZHFjZG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MDY3ODUsImV4cCI6MjA5MDE4Mjc4NX0.F1-lj8f1ZvWybQhy4mQECc58YzuXBgumyfv3qwpKe9g'

export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Create a Supabase client with the family token injected in headers.
 * RLS policies use `x-family-token` to filter data per household.
 */
export function createSupabaseClient(familyToken: string): TypedSupabaseClient {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { 'x-family-token': familyToken },
    },
  })
}

/**
 * Create a Supabase client without family token (for creating a new family).
 */
export function createAnonClient(): TypedSupabaseClient {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
