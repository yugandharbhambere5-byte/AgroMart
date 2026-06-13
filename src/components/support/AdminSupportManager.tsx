'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, Edit3, Trash2, X, Save, MessageSquare, Send, CheckCircle, Clock } from 'lucide-react';
import { SupportTicket, TicketResponse, TicketStatus, SupportCategory } from '@/types/support';
import { createClient } from '@/utils/supabase/client';

export function AdminSupportManager() {
  const supabase = createClient();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const { data, error } = await supabase.from('support_tickets').select('*');
        if (!error && data && data.length > 0) {
          setTickets(data);
          localStorage.setItem('agromart_support_tickets', JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn('Supabase support ticket load failed:', err);
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('agromart_support_tickets');
        if (stored) {
          setTickets(JSON.parse(stored));
        }
      }
    };
    loadTickets();
  }, []);

  // Save changes
  const saveTicketsList = async (list: SupportTicket[]) => {
    setTickets(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('agromart_support_tickets', JSON.stringify(list));
    }
    try {
      await supabase.from('support_tickets').upsert(list);
    } catch (err) {
      console.warn('Supabase support ticket save failed:', err);
    }
  };

  // Change Ticket Status
  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    const updated = tickets.map(t => t.id === ticketId ? { ...t, status } : t);
    saveTicketsList(updated);
    
    // Automatically push notification to the user
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      pushAdminNotif('listing_approved', `Support update: Your ticket "${ticket.subject}" status changed to ${status}.`, ticket.userRole);
      
      if (activeTicket && activeTicket.id === ticketId) {
        setActiveTicket({ ...activeTicket, status });
      }
    }
  };

  const pushAdminNotif = (type: string, text: string, role: 'farmer' | 'buyer') => {
    if (typeof window === 'undefined') return;
    const logStr = localStorage.getItem('agromart_notifications_log');
    const logs = logStr ? JSON.parse(logStr) : [];
    const n = { id: `n-admin-${Date.now()}`, type, text, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), read: false, role };
    localStorage.setItem('agromart_notifications_log', JSON.stringify([n, ...logs]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'agromart_notifications_log', newValue: JSON.stringify([n, ...logs]) }));
  };

  // Send Admin Reply
  const handleSendAdminReply = () => {
    if (!adminReplyText.trim() || !activeTicket) return;

    const newReply: TicketResponse = {
      id: `rep-admin-${Date.now()}`,
      senderRole: 'admin',
      senderName: 'Admin Support Agent',
      text: adminReplyText.trim(),
      date: new Date().toISOString()
    };

    const updated = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          responses: [...t.responses, newReply],
          // Automatically set status to "In Progress" when admin replies
          status: 'In Progress' as TicketStatus
        };
      }
      return t;
    });

    saveTicketsList(updated);
    setAdminReplyText('');

    const currentTkt = updated.find(t => t.id === activeTicket.id);
    if (currentTkt) {
      setActiveTicket(currentTkt);
      pushAdminNotif('new_offer', `New support reply on ticket: "${currentTkt.subject}".`, currentTkt.userRole);
    }
  };

  // Delete Ticket
  const handleDeleteTicket = (ticketId: string) => {
    if (!confirm('Are you sure you want to permanently delete this support ticket?')) return;
    const filtered = tickets.filter(t => t.id !== ticketId);
    saveTicketsList(filtered);
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket(null);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-6 text-left animate-fade-in relative pb-16">
      
      {/* Title */}
      <div className="border-b border-border pb-5">
        <h3 className="text-xl font-black text-foreground flex items-center gap-2">
          <HelpCircle className="w-5.5 h-5.5 text-red-500" />
          <span>Support Complaints Manager</span>
        </h3>
        <p className="text-xs font-bold text-earth-500 mt-1">Review raised disputes, update resolution status, and message users directly.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-earth-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by subject or user name..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder-earth-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-3 rounded-xl border border-border bg-card text-xs font-black text-foreground focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer shrink-0"
        >
          <option value="all">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="flex flex-col gap-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(tkt => (
            <div 
              key={tkt.id} 
              onClick={() => setActiveTicket(tkt)}
              className="p-5 rounded-2xl border border-border bg-card hover:border-red-500/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="min-w-0 flex-grow">
                <h4 className="font-extrabold text-sm text-foreground truncate">{tkt.subject}</h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-earth-500 font-bold uppercase mt-1">
                  <span className="text-red-500 font-black">{tkt.category.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>By {tkt.userName} ({tkt.userRole})</span>
                  <span>•</span>
                  <span>Date: {new Date(tkt.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>💬 {tkt.responses.length} replies</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 border-t border-border sm:border-0 pt-3 sm:pt-0 w-full sm:w-auto">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  tkt.status === 'Open' ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-500/10'
                  : tkt.status === 'In Progress' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-500/10'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-500/10'
                }`}>
                  {tkt.status}
                </span>

                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteTicket(tkt.id); }}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 border-2 border-dashed border-border rounded-3xl text-center text-earth-500 font-bold">
            No support tickets found matching search.
          </div>
        )}
      </div>

      {/* TICKET DETAIL & MESSAGING CHAT OVERLAY */}
      {activeTicket && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setActiveTicket(null)}
          />
          
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in bg-card border border-border no-scrollbar flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-red-100 dark:bg-red-955/20 text-red-600 border border-red-500/10">
                  Ticket Dispute Management
                </span>
                <h3 className="font-extrabold text-foreground text-base mt-2">{activeTicket.subject}</h3>
              </div>
              <button 
                onClick={() => setActiveTicket(null)}
                className="p-2 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-500 hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Info details */}
            <div className="p-6 border-b border-border/40 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs font-bold text-earth-500">
                  User: <span className="font-black text-foreground">{activeTicket.userName}</span> · Role: <span className="font-black text-foreground capitalize">{activeTicket.userRole}</span>
                </div>
                
                {/* Status Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase text-earth-500">Set Status:</span>
                  <select 
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(activeTicket.id, e.target.value as TicketStatus)}
                    className="px-2 py-1 rounded border border-border bg-background text-[10px] font-black uppercase text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-earth-600 dark:text-earth-300 font-semibold leading-relaxed">
                {activeTicket.description}
              </p>
              
              {activeTicket.screenshot && (
                <a 
                  href={activeTicket.screenshot} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:underline w-fit border border-blue-500/20 bg-blue-500/5 px-2.5 py-1.5 rounded-lg"
                >
                  View Attachment screenshot
                </a>
              )}
            </div>

            {/* Responses Log list */}
            <div className="flex-grow p-6 overflow-y-auto min-h-[180px] max-h-[260px] bg-earth-50/30 dark:bg-earth-950/10 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-earth-500 mb-2">Message History</span>
              
              <div className="flex flex-col gap-3">
                {/* Initial Description from user */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-earth-100 dark:bg-earth-800 text-foreground px-4 py-2.5 rounded-2xl rounded-bl-none text-xs font-semibold leading-relaxed">
                    <span className="text-[9px] font-black block opacity-80 mb-1">{activeTicket.userName} ({activeTicket.userRole})</span>
                    {activeTicket.description}
                  </div>
                </div>

                {activeTicket.responses.map(resp => (
                  <div key={resp.id} className={`flex ${resp.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                      resp.senderRole === 'admin'
                        ? 'bg-red-600 text-white rounded-br-none'
                        : 'bg-earth-100 dark:bg-earth-800 text-foreground rounded-bl-none'
                    }`}>
                      <span className="text-[9px] font-black block opacity-85 mb-1">
                        {resp.senderRole === 'admin' ? `Support (You)` : `${resp.senderName} (${activeTicket.userRole})`}
                      </span>
                      {resp.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Input Bar */}
            <div className="p-4 border-t border-border flex gap-3 bg-card sticky bottom-0">
              <input
                type="text"
                value={adminReplyText}
                onChange={e => setAdminReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendAdminReply()}
                placeholder="Type a message reply to the user..."
                className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleSendAdminReply}
                disabled={!adminReplyText.trim()}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
