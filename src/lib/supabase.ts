import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Use placeholders during build when env vars are not set (e.g. Vercel build before env is configured).
// At runtime in production, env vars must be set in Vercel for auth and data to work.
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-anon-key';

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY should be set.');
}

export const supabase: SupabaseClient = createClient(url, key, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
    global: {
        // OVERRIDE: Prevent Next.js from deadlocking the Supabase Client.
        // During soft-navigation (<Link>), Next.js aggressively aborts pending fetches via AbortSignal.
        // Supabase does not handle AbortErrors well, leaving its internal Auth Mutex permanently locked,
        // which causes all subsequent queries ('page to page') to hang infinitely.
        fetch: (url, options) => {
            const cleanOptions = { ...options };
            // Deliberately strip the AbortSignal so the request finishes gracefully in the background
            if (cleanOptions.signal) {
                delete cleanOptions.signal;
            }
            return fetch(url, { ...cleanOptions, cache: 'no-store' });
        }
    }
});
