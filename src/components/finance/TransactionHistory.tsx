'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Search, ExternalLink, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { ReceiptModal } from './ReceiptModal';
import { DealBooking } from '@/types/booking';
import { ScheduleModal } from '../scheduling/ScheduleModal';

interface TransactionHistoryProps {
  userRole: 'farmer' | 'buyer';
  userId?: string; // Optional: used to filter transactions for the specific user
}

export function TransactionHistory({ userRole, userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [bookings, setBookings] = useState<DealBooking[]>([]);

  // Poll or listen for changes in transactions and bookings
  useEffect(() => {
    const loadData = () => {
      if (typeof window !== 'undefined') {
        const storedTxns = localStorage.getItem('agromart_transactions');
        if (storedTxns) {
          const parsed: Transaction[] = JSON.parse(storedTxns);
          const filtered = userId 
            ? parsed.filter(t => userRole === 'farmer' ? t.farmerId === userId : t.buyerId === userId)
            : parsed;
          setTransactions(filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }

        const storedBookings = localStorage.getItem('agromart_bookings');
        if (storedBookings) {
          setBookings(JSON.parse(storedBookings));
        }
      }
    };

    loadData();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agromart_transactions' || e.key === 'agromart_bookings') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [userRole, userId]);

  const filteredTransactions = transactions.filter(t => 
    t.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground">Transaction History</h2>
          <p className="text-sm font-semibold text-earth-500">View and download your past trade receipts</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" />
          <input
            type="text"
            placeholder="Search crop, ID, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-earth-50 dark:bg-earth-900/20 text-earth-500 text-[10px] uppercase font-black tracking-wider">
                <th className="p-4 border-b border-border">Transaction ID & Date</th>
                <th className="p-4 border-b border-border">Crop Details</th>
                <th className="p-4 border-b border-border">{userRole === 'farmer' ? 'Buyer' : 'Farmer'}</th>
                <th className="p-4 border-b border-border">Amount</th>
                <th className="p-4 border-b border-border text-center">Status</th>
                <th className="p-4 border-b border-border text-center">Visit</th>
                <th className="p-4 border-b border-border text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-border/50 hover:bg-earth-50/50 dark:hover:bg-earth-900/10 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-sm text-foreground">{txn.id}</span>
                        <span className="text-xs font-semibold text-earth-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(txn.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-sm text-foreground">{txn.cropName}</span>
                        <span className="text-xs font-semibold text-earth-500">{txn.quantity} {txn.unit} @ ₹{txn.pricePerUnit.toLocaleString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-sm text-foreground">{userRole === 'farmer' ? txn.buyerName : txn.farmerName}</span>
                        <span className="text-xs font-semibold text-earth-500">ID: {userRole === 'farmer' ? txn.buyerId : txn.farmerId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-sm text-primary-600 dark:text-primary-500">
                        ₹{txn.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase">
                        <CheckCircle className="w-3.5 h-3.5" /> {txn.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {(() => {
                        const activeBooking = bookings.find(b => b.transactionId === txn.id && b.status === 'scheduled');
                        if (activeBooking) {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase">
                              <Calendar className="w-3 h-3" /> Scheduled
                            </span>
                          );
                        }
                        return (
                          <button
                            onClick={() => { setSelectedTransaction(txn); setIsScheduleOpen(true); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-xs font-bold transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" /> Book
                          </button>
                        );
                      })()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setSelectedTransaction(txn); setIsReceiptOpen(true); }}
                        className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-background hover:bg-earth-100 dark:hover:bg-earth-800 text-earth-600 hover:text-primary-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="View Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-earth-500 font-semibold text-sm">
                    No transactions found. Completed deals will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isReceiptOpen && selectedTransaction && (
        <ReceiptModal 
          transaction={selectedTransaction} 
          onClose={() => { setIsReceiptOpen(false); setSelectedTransaction(null); }} 
        />
      )}

      {isScheduleOpen && selectedTransaction && (
        <ScheduleModal
          transaction={selectedTransaction}
          userRole={userRole}
          onClose={() => { setIsScheduleOpen(false); setSelectedTransaction(null); }}
          onSave={() => {
            // Trigger storage event to refresh bookings in case loadData needs it,
            // but it already fires from the modal. We can just force a local refresh.
            const storedBookings = localStorage.getItem('agromart_bookings');
            if (storedBookings) setBookings(JSON.parse(storedBookings));
          }}
        />
      )}
    </div>
  );
}
