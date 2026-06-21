import { createBrowserClient } from '@supabase/ssr';

let cachedMockClient: any = null;

export function createClient(): ReturnType<typeof createBrowserClient> {
  let url = null;
  let anonKey = null;

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('agromart_custom_supabase_url');
    const customKey = localStorage.getItem('agromart_custom_supabase_anon_key');
    if (customUrl && customKey) {
      url = customUrl;
      anonKey = customKey;
    }
  }

  if (!url || !anonKey) {
    if (!cachedMockClient) {
      cachedMockClient = {
        auth: {
          signUp: async ({ email, phone, password, options }: { email?: string; phone?: string; password?: string; options?: any }) => {
            console.warn('Mock Supabase client: signUp mock response triggered');
            if (typeof window !== 'undefined') {
              const storedUsers = localStorage.getItem('agromart_mock_users');
              let users = storedUsers ? JSON.parse(storedUsers) : [];
              
              if (email && users.some((u: any) => u.email === email)) {
                return { data: { user: null }, error: { message: 'An account with this email already exists.' } };
              }
              if (phone && users.some((u: any) => u.phone === phone)) {
                return { data: { user: null }, error: { message: 'An account with this mobile number already exists.' } };
              }
              
              const newUserId = 'mock-user-' + Math.random().toString(36).substring(2, 11);
              const mockUser = {
                id: newUserId,
                email: email || null,
                phone: phone || null,
                user_metadata: options?.data || {}
              };
              
              users.push({
                id: newUserId,
                email: email || null,
                phone: phone || null,
                password: password,
                user_metadata: options?.data || {}
              });
              
              localStorage.setItem('agromart_mock_users', JSON.stringify(users));
              
              // Seed profiles tables in localStorage
              const profilesKey = 'agromart_mock_profiles';
              const profiles = localStorage.getItem(profilesKey) ? JSON.parse(localStorage.getItem(profilesKey)!) : [];
              profiles.push({
                id: newUserId,
                full_name: options?.data?.full_name || '',
                email: email || '',
                phone: phone || '',
                role: options?.data?.role || 'farmer',
                state: options?.data?.state || '',
                district: options?.data?.district || '',
                taluka: options?.data?.taluka || '',
                village: options?.data?.village || '',
                address: options?.data?.address || '',
                pincode: options?.data?.pincode || '',
                preferred_language: options?.data?.preferred_language || 'en',
                google_map_link: options?.data?.google_map_link || '',
                latitude: options?.data?.latitude || null,
                longitude: options?.data?.longitude || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              localStorage.setItem(profilesKey, JSON.stringify(profiles));
              
              if (options?.data?.role === 'farmer') {
                const fpKey = 'agromart_mock_farmer_profiles';
                const farmerProfiles = localStorage.getItem(fpKey) ? JSON.parse(localStorage.getItem(fpKey)!) : [];
                farmerProfiles.push({
                  id: newUserId,
                  user_id: newUserId,
                  farm_size: options?.data?.farm_size || '',
                  main_crops: options?.data?.main_crops || [],
                  farming_type: options?.data?.farming_type || 'organic',
                  name: options?.data?.full_name || '',
                  address: options?.data?.address || '',
                  contact_number: phone || '',
                  ratings: 5.0,
                  reviews_count: 0
                });
                localStorage.setItem(fpKey, JSON.stringify(farmerProfiles));
              } else {
                const bpKey = 'agromart_mock_buyer_profiles';
                const buyerProfiles = localStorage.getItem(bpKey) ? JSON.parse(localStorage.getItem(bpKey)!) : [];
                buyerProfiles.push({
                  id: newUserId,
                  user_id: newUserId,
                  shop_name: options?.data?.shop_name || '',
                  owner_name: options?.data?.full_name || '',
                  business_type: options?.data?.business_type || 'Other',
                  gst_number: options?.data?.gst_number || '',
                  shop_address: options?.data?.shop_address || options?.data?.address || '',
                  address: options?.data?.address || '',
                  contact_number: phone || '',
                  working_days: 'Monday - Saturday',
                  timings: '09:00 AM - 06:00 PM',
                  ratings: 5.0,
                  reviews_count: 0
                });
                localStorage.setItem(bpKey, JSON.stringify(buyerProfiles));
              }
              
              return { data: { user: mockUser }, error: null };
            }
            return { data: { user: null }, error: { message: 'Window is not defined' } };
          },
          signInWithPassword: async ({ email, phone, password }: { email?: string; phone?: string; password?: string }) => {
            console.warn('Mock Supabase client: signInWithPassword mock response triggered');
            if (typeof window !== 'undefined') {
              // 1. Check if email/phone match admin
              let correctPassword = 'admin123';
              correctPassword = localStorage.getItem('agro-mart-mock-admin-pass') || 'admin123';
              
              const isHardcodedAdmin = 
                (email === 'admin@agromart.com' && password === correctPassword) ||
                (email === 'yugandharbhambere5@gmail.com' && password === 'Admin@123');

              if (isHardcodedAdmin) {
                const isUserReqAdmin = email === 'yugandharbhambere5@gmail.com';
                const mockUser = {
                  id: isUserReqAdmin ? 'mock-admin-yugandhar' : 'mock-admin-12345',
                  email: email,
                  user_metadata: {
                    role: 'admin',
                    full_name: isUserReqAdmin ? 'Yugandhar Bhambere' : 'System Administrator',
                  }
                };
                localStorage.setItem('agro-mart-mock-user', JSON.stringify(mockUser));
                document.cookie = `agro-mart-mock-user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/`;
                return { data: { user: mockUser, session: { user: mockUser, access_token: 'mock-access-token' } }, error: null };
              }
              
              // 2. Check registered users list
              const storedUsers = localStorage.getItem('agromart_mock_users');
              const users = storedUsers ? JSON.parse(storedUsers) : [];
              
              let matchedUser = users.find((u: any) => {
                if (email && u.email === email) return true;
                if (phone && u.phone === phone) return true;
                return false;
              });

              if (!matchedUser) {
                // Auto-create/restore mock user on this new device
                const newUserId = 'mock-user-' + Math.random().toString(36).substring(2, 11);
                
                // Detect role from email/phone clues
                const isBuyer = 
                  (email && (email.includes('buyer') || email.includes('trade') || email.includes('ginning') || email.includes('mauli') || email.includes('corp') || email.includes('shop') || email.includes('trader'))) ||
                  (phone && (phone.includes('9876543210') || phone.includes('7654300003')));
                  
                const detectedRole = isBuyer ? 'buyer' : 'farmer';
                
                const emailPrefix = email ? email.split('@')[0] : '';
                let detectedName = emailPrefix
                  ? emailPrefix.split(/[\._-]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                  : (detectedRole === 'farmer' ? 'Kanha Patil' : 'Mauli Ginning');

                if (phone && phone.includes('8767366332')) {
                  detectedName = 'Kanha Patil';
                }

                matchedUser = {
                  id: newUserId,
                  email: email || null,
                  phone: phone || null,
                  password: password,
                  user_metadata: {
                    role: detectedRole,
                    fullName: detectedName,
                    full_name: detectedName
                  }
                };

                users.push(matchedUser);
                localStorage.setItem('agromart_mock_users', JSON.stringify(users));

                // Also seed the profiles table
                const profilesKey = 'agromart_mock_profiles';
                const profiles = localStorage.getItem(profilesKey) ? JSON.parse(localStorage.getItem(profilesKey)!) : [];
                profiles.push({
                  id: newUserId,
                  full_name: detectedName,
                  email: email || '',
                  phone: phone || '',
                  role: detectedRole,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                localStorage.setItem(profilesKey, JSON.stringify(profiles));

                // Seed specific farmer/buyer profile
                if (detectedRole === 'farmer') {
                  const fpKey = 'agromart_mock_farmer_profiles';
                  const farmerProfiles = localStorage.getItem(fpKey) ? JSON.parse(localStorage.getItem(fpKey)!) : [];
                  farmerProfiles.push({
                    id: newUserId,
                    user_id: newUserId,
                    name: detectedName,
                    contact_number: phone || '',
                    ratings: 5.0,
                    reviews_count: 0
                  });
                  localStorage.setItem(fpKey, JSON.stringify(farmerProfiles));
                } else {
                  const bpKey = 'agromart_mock_buyer_profiles';
                  const buyerProfiles = localStorage.getItem(bpKey) ? JSON.parse(localStorage.getItem(bpKey)!) : [];
                  buyerProfiles.push({
                    id: newUserId,
                    user_id: newUserId,
                    shop_name: detectedName,
                    owner_name: detectedName,
                    business_type: 'Other',
                    contact_number: phone || '',
                    ratings: 5.0,
                    reviews_count: 0
                  });
                  localStorage.setItem(bpKey, JSON.stringify(buyerProfiles));
                }
              }
              
              if (matchedUser) {
                // In mock mode, allow any password to prevent testing blockages
                localStorage.setItem('agro-mart-mock-user', JSON.stringify(matchedUser));
                document.cookie = `agro-mart-mock-user=${encodeURIComponent(JSON.stringify(matchedUser))}; path=/`;
                return {
                  data: {
                    user: matchedUser,
                    session: { user: matchedUser, access_token: 'mock-access-token' }
                  },
                  error: null
                };
              }
            }
            return { data: { user: null, session: null }, error: { message: 'Account not found. Please register.' } };
          },
          resetPasswordForEmail: async (email: string, options?: any) => {
            console.warn('Mock Supabase client: resetPasswordForEmail mock response triggered for', email);
            if (typeof window !== 'undefined') {
              const storedUsers = localStorage.getItem('agromart_mock_users');
              const users = storedUsers ? JSON.parse(storedUsers) : [];
              const matched = users.some((u: any) => u.email === email) || email === 'admin@agromart.com' || email === 'yugandharbhambere5@gmail.com';
              if (matched) {
                return { data: {}, error: null };
              }
            }
            return { data: null, error: { message: 'Email address not found.' } };
          },
          signInWithOtp: async ({ email, phone }: { email?: string; phone?: string }) => {
            console.warn('Mock Supabase client: signInWithOtp mock response triggered');
            return { data: {}, error: null };
          },
          verifyOtp: async ({ email, phone, token }: { email?: string; phone?: string; token: string }) => {
            console.warn('Mock Supabase client: verifyOtp mock response triggered');
            
            let role = 'farmer';
            let id = 'mock-user-12345';
            let fullName = 'Farmer';
            
            if (typeof window !== 'undefined') {
              role = localStorage.getItem('agro-mart-temp-role') || 'farmer';
              const storedUsers = localStorage.getItem('agromart_mock_users');
              const users = storedUsers ? JSON.parse(storedUsers) : [];
              const matched = users.find((u: any) => (email && u.email === email) || (phone && u.phone === phone));
              if (matched) {
                role = matched.user_metadata?.role || role;
                id = matched.id;
                fullName = matched.user_metadata?.full_name || fullName;
              }
            }

            const mockUser = {
              id,
              email: email || null,
              phone: phone || null,
              user_metadata: {
                role: role,
                full_name: fullName,
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

                  // Update matching user in users list
                  const storedUsers = localStorage.getItem('agromart_mock_users');
                  if (storedUsers) {
                    const users = JSON.parse(storedUsers);
                    const updatedUsers = users.map((u: any) => {
                      if (u.id === parsed.id) {
                        return {
                          ...u,
                          password: password || u.password,
                          user_metadata: {
                            ...u.user_metadata,
                            ...(data || {})
                          }
                        };
                      }
                      return u;
                    });
                    localStorage.setItem('agromart_mock_users', JSON.stringify(updatedUsers));
                  }
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
          const getStorageData = () => {
            if (typeof window === 'undefined') return [];
            // Map actual tables to key names
            const key = `agromart_mock_${table}`;
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
          };
          const setStorageData = (data: any) => {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`agromart_mock_${table}`, JSON.stringify(data));
            }
          };
          return {
            select: (fields?: string) => {
              return {
                eq: (column: string, value: any) => {
                  const buildQuery = () => {
                    const list = getStorageData();
                    const filtered = list.filter((x: any) => {
                      // Check standard field or snake_case key
                      return x[column] === value || x[column.toLowerCase()] === value || x[column.replace(/_([a-z])/g, (g) => g[1].toUpperCase())] === value;
                    });
                    return filtered;
                  };
                  return {
                    single: () => {
                      const filtered = buildQuery();
                      return Promise.resolve({ data: filtered[0] || null, error: null });
                    },
                    order: (col: string, opt: any) => {
                      const filtered = buildQuery();
                      return Promise.resolve({ data: filtered, error: null });
                    },
                    eq: (col2: string, val2: any) => {
                      const list = buildQuery();
                      const filtered = list.filter((x: any) => x[col2] === val2 || x[col2.toLowerCase()] === val2);
                      return Promise.resolve({ data: filtered, error: null });
                    },
                    // Return raw thenable/promise
                    then: (onfulfilled: any) => {
                      const filtered = buildQuery();
                      return Promise.resolve({ data: filtered, error: null }).then(onfulfilled);
                    }
                  };
                },
                then: (onfulfilled: any) => {
                  const list = getStorageData();
                  return Promise.resolve({ data: list, error: null }).then(onfulfilled);
                }
              };
            },
            insert: (row: any) => {
              const list = getStorageData();
              const rows = Array.isArray(row) ? row : [row];
              const added: any[] = [];
              rows.forEach(r => {
                const newRow = { ...r };
                if (!newRow.id) newRow.id = r.user_id || 'mock-id-' + Math.random().toString(36).substring(2, 7);
                list.push(newRow);
                added.push(newRow);
              });
              setStorageData(list);
              return {
                select: () => Promise.resolve({ data: added, error: null }),
                then: (onfulfilled: any) => Promise.resolve({ data: added, error: null }).then(onfulfilled)
              };
            },
            update: (updates: any) => {
              return {
                eq: (column: string, value: any) => {
                  const list = getStorageData();
                  const updated: any[] = [];
                  const newList = list.map((x: any) => {
                    if (x[column] === value || x[column.toLowerCase()] === value || x[column.replace(/_([a-z])/g, (g) => g[1].toUpperCase())] === value) {
                      const newX = { ...x, ...updates };
                      updated.push(newX);
                      return newX;
                    }
                    return x;
                  });
                  setStorageData(newList);
                  return Promise.resolve({ data: updated, error: null });
                }
              };
            },
            delete: () => {
              return {
                eq: (column: string, value: any) => {
                  const list = getStorageData();
                  const newList = list.filter((x: any) => x[column] !== value && x[column.toLowerCase()] !== value);
                  setStorageData(newList);
                  return Promise.resolve({ data: [], error: null });
                }
              };
            }
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
