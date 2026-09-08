/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') || '' : '';

  const url = (envUrl && envUrl !== 'YOUR_SUPABASE_URL') ? envUrl : storedUrl;
  const key = (envKey && envKey !== 'YOUR_SUPABASE_ANON_KEY') ? envKey : storedKey;

  const isConfigured = Boolean(url && key);
  return { url, key, isConfigured };
}

export function createSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  try {
    return createClient(url, key);
  } catch (e) {
    console.error('Failed to create Supabase client:', e);
    return null;
  }
}

export const isSupabaseConfigured = getSupabaseConfig().isConfigured;
export const supabase = createSupabaseClient();
