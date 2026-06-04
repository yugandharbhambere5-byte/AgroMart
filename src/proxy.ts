import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // 1. Role-based Dashboard Route Protection
  if (url.pathname.startsWith('/dashboard')) {
    // If not logged in, redirect to login
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const role = user.user_metadata?.role || 'farmer';

    // If user accesses root dashboard, redirect to their role-specific panel
    if (url.pathname === '/dashboard') {
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    // Force redirection if a user tries to access a dashboard that does not match their metadata role
    if (url.pathname.startsWith('/dashboard/farmer') && role !== 'farmer') {
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }
    if (url.pathname.startsWith('/dashboard/buyer') && role !== 'buyer') {
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }
    if (url.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }
  }

  // 2. Redirect logged-in users away from Auth pages (login/register) to their dashboards
  if (user && (url.pathname === '/login' || url.pathname === '/register')) {
    const role = user.user_metadata?.role || 'farmer';
    url.pathname = `/dashboard/${role}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json / service worker files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
