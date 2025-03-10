
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/lib/toast';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmyrltwtvpfrbdiwoqem.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJteXJsdHd0dnBmcmJkaXdvcWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NjQwMDQsImV4cCI6MjA1NzE0MDAwNH0.FHWGZ-w2sa6hP0EHZYwuCF5e8st0LrQxbWqMNTJ5qg8';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  const errorMessage = error.message || 'An unexpected error occurred';
  toast.error(errorMessage);
  return errorMessage;
};
