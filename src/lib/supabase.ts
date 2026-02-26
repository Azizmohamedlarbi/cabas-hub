import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (typeof window !== 'undefined') {
    console.log('[Supabase Core] Initializing Client module');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
