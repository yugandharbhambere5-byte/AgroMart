'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ShieldCheck, LogOut, CheckCircle, XCircle, Users, Scale, FileText, AlertTriangle } from 'lucide-react';

interface VerificationRequest {
  id: string;
  name: string;
  type: 'farmer' | 'buyer';
  location: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [queue, setQueue] = useState<VerificationRequest[]>([
    { id: 'u01', name: 'Sunny Oak Orchards', type: 'farmer', location: 'California, US' },
    { id: 'u02', name: 'Metro Foods Logistics', type: 'buyer', location: 'New York, US' },
  ]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleApprove = (userId: string) => {
    setQueue(queue.filter(q => q.id !== userId));
    alert(`Account #${userId} verified successfully. Credentials updated.`);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Operational Admin Panel</h1>
          <p className="text-sm font-semibold text-earth-550 dark:text-earth-400 mt-1">
            Global marketplace administration, user audits, profile verifications, and trade dispute mediations.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-sm font-extrabold transition-all cursor-pointer self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        
        <div className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Total Active Users</span>
            <span className="text-2xl font-black text-foreground">15,920</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-650 flex items-center justify-center">
            <Users className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Pending Verifies</span>
            <span className="text-2xl font-black text-foreground">{queue.length} Accounts</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-650 flex items-center justify-center">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Escrow Holds</span>
            <span className="text-2xl font-black text-foreground">$142.4K</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-650 flex items-center justify-center">
            <Scale className="w-5.5 h-5.5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Active Disputes</span>
            <span className="text-2xl font-black text-foreground text-rose-500">0 Disputes</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5.5 h-5.5" />
          </div>
        </div>

      </div>

      {/* Admin Operations Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Verification Queue */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
          <div className="border-b border-border pb-5">
            <h3 className="text-lg font-black text-foreground">Pending Registrations Queue</h3>
            <p className="text-xs font-bold text-earth-500">Verify government agriculture registry numbers and logistics credentials</p>
          </div>

          <div className="flex flex-col gap-4">
            {queue.length > 0 ? (
              queue.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-border bg-background hover:border-primary-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-650 flex items-center justify-center shrink-0">
                      <FileText className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-sm sm:text-base leading-snug">{req.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-earth-500 mt-0.5 font-bold">
                        <span className="capitalize">{req.type}</span>
                        <span>•</span>
                        <span>Location: {req.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3.5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Verify Account</span>
                    </button>
                    <button
                      onClick={() => {
                        setQueue(queue.filter(q => q.id !== req.id));
                        alert(`Account #${req.id} verification rejected.`);
                      }}
                      className="px-3.5 py-2.5 rounded-lg border border-red-500/20 text-red-500 font-extrabold text-xs hover:bg-red-500/5 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm font-semibold text-earth-500">
                ✓ No pending verifications. Queue is clear.
              </div>
            )}
          </div>
        </div>

        {/* Dispute Resolution Center */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
          <div className="border-b border-border pb-5">
            <h3 className="text-lg font-black text-foreground">Disputes Resolution Center</h3>
            <p className="text-xs font-bold text-earth-500">Mediate cargo quality, temperature drops, or payment delays</p>
          </div>

          <div className="flex flex-col gap-4 items-center justify-center py-10 text-center">
            <AlertTriangle className="w-10 h-10 text-earth-400" />
            <div>
              <span className="font-extrabold text-sm text-foreground">Zero Active Escrow Disputes</span>
              <p className="text-[10px] text-earth-500 font-bold max-w-[200px] mt-1">Platform transactions are running smoothly. All deliveries match verified quality checklists.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
