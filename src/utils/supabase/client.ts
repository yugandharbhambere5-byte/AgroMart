import { createBrowserClient } from '@supabase/ssr';

let cachedMockClient: any = null;

export function createClient(): ReturnType<typeof createBrowserClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url?.includes('placeholder') || anonKey?.includes('placeholder')) {
    if (!cachedMockClient) {
      cachedMockClient = {
        auth: {
          signInWithPassword: async ({ email, password }: { email?: string; password?: string }) => {
            console.warn('Mock Supabase client: signInWithPassword mock response triggered');
            let correctPassword = 'admin123';
            if (typeof window !== 'undefined') {
              correctPassword = localStorage.getItem('agro-mart-mock-admin-pass') || 'admin123';
            }
            if (email === 'admin@agromart.com' && password === correctPassword) {
              const mockUser = {
                id: 'mock-admin-12345',
                email: email,
                user_metadata: {
                  role: 'admin',
                  full_name: 'System Administrator',
                }
              };
              if (typeof window !== 'undefined') {
                localStorage.setItem('agro-mart-mock-user', JSON.stringify(mockUser));
                document.cookie = `agro-mart-mock-user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/`;
              }
              return {
                data: {
                  user: mockUser,
                  session: {
                    user: mockUser,
                    access_token: 'mock-access-token',
                  }
                },
                error: null
              };
            }
            return {
              data: { user: null, session: null },
              error: { message: `Invalid credentials. Please use admin@agromart.com and ${correctPassword}.` }
            };
          },
          resetPasswordForEmail: async (email: string, options?: any) => {
            console.warn('Mock Supabase client: resetPasswordForEmail mock response triggered for', email);
            return { data: {}, error: null };
          },
          signInWithOtp: async ({ email, phone }: { email?: string; phone?: string }) => {
            console.warn('Mock Supabase client: signInWithOtp mock response triggered');
            return { data: {}, error: null };
          },
          verifyOtp: async ({ email, phone, token }: { email?: string; phone?: string; token: string }) => {
            console.warn('Mock Supabase client: verifyOtp mock response triggered');
            
            let role = 'farmer';
            if (email?.includes('buyer') || phone?.endsWith('00')) {
              role = 'buyer';
            } else if (email?.includes('admin') || phone?.endsWith('99')) {
              role = 'admin';
            } else if (typeof window !== 'undefined') {
              role = localStorage.getItem('agro-mart-temp-role') || 'farmer';
            }

            const mockUser = {
              id: 'mock-user-12345',
              email: email || 'farmer@test.com',
              phone: phone || null,
              user_metadata: {
                role: role,
                full_name: 'Demo Local User',
              }
            };

            if (typeof window !== 'undefined') {
              localStorage.setItem('agro-mart-mock-user', JSON.stringify(mockUser));
              document.cookie = `agro-mart-mock-user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/`;
            }

            return {
              data: {
                user: mockUser,
                session: {
                  user: mockUser,
                  access_token: 'mock-access-token',
                }
              },
              error: null
            };
          },
          getUser: async () => {
            let user = null;
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('agro-mart-mock-user');
              if (stored) {
                try {
                  user = JSON.parse(stored);
                } catch {}
              }
            }
            return { data: { user }, error: null };
          },
          getSession: async () => {
            let user = null;
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('agro-mart-mock-user');
              if (stored) {
                try {
                  user = JSON.parse(stored);
                } catch {}
              }
            }
            return {
              data: {
                session: user ? { user, access_token: 'mock-access-token' } : null
              },
              error: null
            };
          },
          signOut: async () => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('agro-mart-mock-user');
              document.cookie = 'agro-mart-mock-user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
            return { error: null };
          },
          updateUser: async ({ data, password }: { data?: any; password?: string }) => {
            console.warn('Mock Supabase client: updateUser mock response triggered', data, password);
            if (password && typeof window !== 'undefined') {
              localStorage.setItem('agro-mart-mock-admin-pass', password);
            }
            let user = null;
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('agro-mart-mock-user');
              if (stored) {
                try {
                  const parsed = JSON.parse(stored);
                  const updatedUser = {
                    ...parsed,
                    user_metadata: {
                      ...parsed.user_metadata,
                      ...(data || {})
                    }
                  };
                  localStorage.setItem('agro-mart-mock-user', JSON.stringify(updatedUser));
                  document.cookie = `agro-mart-mock-user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/`;
                  user = updatedUser;
                } catch {}
              }
            }
            return { data: { user }, error: null };
          },
          onAuthStateChange: (callback: (event: any, session: any) => void) => {
            let user = null;
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('agro-mart-mock-user');
              if (stored) {
                try {
                  user = JSON.parse(stored);
                } catch {}
              }
            }
            // Defer execution to prevent synchronous re-rendering loop
            setTimeout(() => {
              callback('SIGNED_IN', user ? { user } : null);
            }, 0);

            return {
              data: {
                subscription: {
                  unsubscribe: () => {}
                }
              }
            };
          }
        },
        from: (table: string) => {
          return {
            select: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [], error: null }),
                eq: () => Promise.resolve({ data: [], error: null }),
                insert: () => Promise.resolve({ data: [], error: null }),
                delete: () => Promise.resolve({ data: [], error: null }),
                update: () => Promise.resolve({ data: [], error: null }),
              }),
              insert: () => Promise.resolve({ data: [], error: null }),
              delete: () => Promise.resolve({ data: [], error: null }),
              update: () => Promise.resolve({ data: [], error: null }),
            }),
            insert: () => ({
              select: () => Promise.resolve({ data: [], error: null }),
            }),
            delete: () => ({
              eq: () => Promise.resolve({ data: [], error: null }),
            }),
            update: () => ({
              eq: () => Promise.resolve({ data: [], error: null }),
            }),
          };
        },
        storage: {
          from: (bucket: string) => {
            return {
              upload: async (path: string, file: Blob) => {
                console.warn('Mock Storage: upload path', path);
                return { data: { path }, error: null };
              },
              getPublicUrl: (path: string) => {
                console.warn('Mock Storage: getPublicUrl for path', path);
                const randomProduce = ['wheat', 'potato', 'tomato', 'corn', 'apples'][Math.floor(Math.random() * 5)];
                const mockProduceUrl = `https://images.unsplash.com/photo-${
                  randomProduce === 'wheat' ? '1574323347407-f5e1ad6d020b' :
                  randomProduce === 'potato' ? '1518977676601-b53f82aba655' :
                  randomProduce === 'tomato' ? '1592924357228-91a4daadcfea' :
                  randomProduce === 'corn' ? '1551754655-cd27e38d20f6' :
                  '1619546813926-a78fa6372cd2'
                }?w=600&auto=format&fit=crop`;
                return { data: { publicUrl: mockProduceUrl } };
              }
            };
          }
        }
      } as unknown as ReturnType<typeof createBrowserClient>;
    }
    return cachedMockClient;
  }

  return createBrowserClient(url!, anonKey!);
}
