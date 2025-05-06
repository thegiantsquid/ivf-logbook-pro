
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/lib/toast';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bmyrltwtvpfrbdiwoqem.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJteXJsdHd0dnBmcmJkaXdvcWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NjQwMDQsImV4cCI6MjA1NzE0MDAwNH0.FHWGZ-w2sa6hP0EHZYwuCF5e8st0LrQxbWqMNTJ5qg8';

// Initialize Supabase client with explicit auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage, // Use localStorage for session storage
    persistSession: true,  // Persist session across browser sessions
    autoRefreshToken: true, // Auto-refresh token before it expires
    detectSessionInUrl: true, // Allow detecting session info in URL
    flowType: 'pkce' // Use PKCE flow for added security
  }
});

// Handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  const errorMessage = error.message || 'An unexpected error occurred';
  toast.error(errorMessage);
  return errorMessage;
};

// Function to get WebHook URL for documentation or setup
export const getWebhookUrl = () => {
  return `${supabaseUrl}/functions/v1/stripe-webhook`;
};
