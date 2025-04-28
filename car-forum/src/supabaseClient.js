import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qqlstmfprdkjtwztelqy.supabase.co'
// Using a valid anon key - get this from your Supabase project settings
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbHN0bWZwcmRranR3enRlbHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODc5MzUsImV4cCI6MjA2MTI2MzkzNX0.PpU3NzUsoYHxiR0hxFZKY5Vnvob4dJxDNPTmKzS-UQQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
