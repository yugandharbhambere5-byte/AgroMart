'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Compass, LogOut, CheckCircle, ArrowUpRight, ShieldCheck, Thermometer, MapPin, Truck } from 'lucide-react';

interface ActiveOrder {
  id: string;
  farmer: string;
  crop: string;
  amount: string;
  status: 'in_transit' | 'awaiting_escrow_deposit' | 'delivered';
  temperature: string;
}

export default function BuyerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState<ActiveOrder[]>([
    { id: '101', farmer: 'Green Mountain Cooperatives', crop: 'Russet Baking Potatoes', amount: '$900.00', status: 'in_transit', temperature: '4.5°C' },
    { id: '102', farmer: 'Pine Tree Orchards', crop: 'Honeycrisp Apples', amount: '$1,200.00', status: 'awaiting_escrow_deposit', temperature: 'N/A' },
  ]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleReleaseEscrow = (orderId: string) => {
    alert(`Releasing escrow payout for Order #${orderId} to grower. Payout process initiated.`);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Buyer Procurement</h1>
          <p className="text-sm font-semibold text-earth-550 dark:text-earth-400 mt-1">
            Procure fresh crops directly from farms, check live shipment temperatures, and authorize payout distributions.
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-2xl border border-border bg-card flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Total Purchase Volume</span>
            <span className="text-2xl font-black text-foreground">$18,650.00</span>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.2% this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Escrow Balance</span>
            <span className="text-2xl font-black text-foreground">$2,100.00</span>
            <span className="text-[10px] font-bold text-earth-500">Held securely by bank agent</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card flex items-center justify-between hover-lift">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-earth-500 uppercase tracking-wider">Active Cargo Fleet</span>
            <span className="text-2xl font-black text-foreground">1 cooling truck</span>
            <span className="text-[10px] font-bold text-emerald-500">Live GPS tracking active</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Area: Orders & Logistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Sourcing Contracts */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
          <div className="border-b border-border pb-5">
            <h3 className="text-lg font-black text-foreground">My Sourcing Bids</h3>
            <p className="text-xs font-bold text-earth-500">Track active shipments and escrow fund releases</p>
          </div>

          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl border border-border bg-background hover:border-primary-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-earth-500">Order #{order.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          order.status === 'in_transit'
                            ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-foreground text-base leading-snug">{order.crop}</h4>
                    <p className="text-xs font-bold text-earth-500">Farmer Partner: {order.farmer}</p>
                  </div>
                </div>

                {/* Logistics & Escrow button */}
                <div className="flex items-center gap-4 border-t border-earth-100 dark:border-earth-900 pt-4 sm:pt-0 sm:border-0 justify-between sm:justify-end">
                  {order.status === 'in_transit' && (
                    <div className="flex items-center gap-2.5 bg-earth-100 dark:bg-earth-900 px-3.5 py-2 rounded-xl border border-border">
                      <Thermometer className="w-4 h-4 text-primary-500" />
                      <span className="text-xs font-black text-foreground">{order.temperature}</span>
                    </div>
                  )}

                  {order.status === 'in_transit' ? (
                    <button
                      onClick={() => handleReleaseEscrow(order.id)}
                      className="px-4.5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Release Escrow</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => alert('Depositing funds to escrow partner...')}
                      className="px-4.5 py-3 rounded-xl bg-harvest-500 hover:bg-harvest-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                    >
                      Deposit $1,200.00
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Cold-Chain Logistics Map Placeholder */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border flex flex-col gap-6">
          <div className="border-b border-border pb-5">
            <h3 className="text-lg font-black text-foreground">Fleet Map</h3>
            <p className="text-xs font-bold text-earth-500">Live shipping routes and cold-storage tracking</p>
          </div>

          <div className="relative h-60 bg-earth-100 dark:bg-earth-900 rounded-2xl overflow-hidden border border-border flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            <div className="relative z-10 flex flex-col items-center gap-2.5 text-center px-4">
              <MapPin className="w-8 h-8 text-primary-600 animate-bounce" />
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Truck-101 Route active</span>
              <p className="text-[10px] text-earth-500 font-bold max-w-[200px]">En route to Boston Warehouse Depot. ETA: 2h 45m.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
