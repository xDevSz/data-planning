import { createClient } from '@supabase/supabase-js';

// Substitua pelos seus dados reais do Supabase
const supabaseUrl = 'https://opckfwugxxszkcduzyai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wY2tmd3VneHhzemtjZHV6eWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODU5OTMsImV4cCI6MjA3ODk2MTk5M30.m3HP3ezHze83EVRvLApDce84R51M8XxRFevFSSVV6vg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);