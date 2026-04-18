import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmvwkgkijqbyxfhpesaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdndrZ2tpanFieXhmaHBlc2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzAxODEsImV4cCI6MjA4OTgwNjE4MX0.LXg8hr6KwOdPcYSW5jCvacj_FntB-uuvWtW_yj0q0kQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
