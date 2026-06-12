import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient(): Promise<ReturnType<typeof createServerClient>> {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url?.includes('placeholder') || anonKey?.includes('placeholder')) {
    const mockCookie = cookieStore.get('agro-mart-mock-user')?.value;
    let user = null;
    if (mockCookie) {
      try {
        user = JSON.parse(decodeURIComponent(mockCookie));
      } catch {}
    }

    return {
      auth: {
        getUser: async () => {
          return { data: { user }, error: null };
        },
        getSession: async () => {
          return {
            data: {
              session: user ? { user, access_token: 'mock-access-token' } : null
            },
            error: null
          };
        },
        signOut: async () => {
          return { error: null };
        }
      }
    } as unknown as ReturnType<typeof createServerClient>;
  }

  return createServerClient(
    url!,
    anonKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
