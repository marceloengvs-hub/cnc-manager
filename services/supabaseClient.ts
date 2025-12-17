import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mvrkfznnejqrqohqjjeb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qR4iX2TkZ2wuAwaorne42g_in_RbYSv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);