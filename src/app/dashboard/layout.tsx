import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Sprout, LayoutDashboard } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RegisterSW } from '@/components/RegisterSW';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Define a simple Sign Out handler URL or we can provide a header client component.
  // Let's keep it simple: the dashboards can import a client component or a simple button.

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">
              Agro<span className="text-primary-500">Mart</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-sm font-bold text-earth-500">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-earth-100 dark:bg-earth-900 border border-border">
              <LayoutDashboard className="w-4 h-4 text-primary-500" />
              <span className="capitalize text-xs font-black text-foreground">
                {user.user_metadata?.role || 'User'} Mode
              </span>
            </div>
            <span className="hidden sm:inline text-xs font-bold text-earth-450 truncate max-w-[150px]">
              {user.email || user.phone}
            </span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Area */}
      <div className="flex-grow flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
