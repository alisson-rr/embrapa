import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://skmedtgbqmdhwsfooxwy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbWVkdGdicW1kaHdzZm9veHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Mzk1NTksImV4cCI6MjA3NjExNTU1OX0.CbkNLRTC5zwct1Bb6_M3Unn4e9KGZoQZsIVcGwaNCJY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
