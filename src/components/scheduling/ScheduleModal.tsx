import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { DealBooking } from '@/types/booking';

interface ScheduleModalProps {
  transaction: Transaction;
  userRole: 'farmer' | 'buyer';
  existingBooking?: DealBooking; // If provided, we are rescheduling
  onClose: () => void;
  onSave: () => void; // Called after saving to trigger refresh
}

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
];

export function ScheduleModal({ transaction, userRole, existingBooking, onClose, onSave }: ScheduleModalProps) {
  const [date, setDate] = useState<string>(existingBooking?.date || '');
  const [timeSlot, setTimeSlot] = useState<string>(existingBooking?.timeSlot || '');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  // Get tomorrow's date as the minimum date allowed
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  useEffect(() => {
    if (!date) {
      setBookedSlots([]);
      return;
    }

    // Load existing bookings from local storage to check for conflicts
    const stored = localStorage.getItem('agromart_bookings');
    if (stored) {
      const allBookings: DealBooking[] = JSON.parse(stored);
      // Find bookings for the current date that involve this transaction's participants
      // We block slots if either the farmer or buyer is already booked at that time.
      const conflictingBookings = allBookings.filter(b => 
        b.date === date &&
        b.status === 'scheduled' &&
        b.id !== existingBooking?.id && // Don't conflict with the current booking being rescheduled
        (b.farmerId === transaction.farmerId || b.buyerId === transaction.buyerId)
      );
      
      setBookedSlots(conflictingBookings.map(b => b.timeSlot));
    }
  }, [date, existingBooking, transaction]);

  const handleSave = () => {
    if (!date || !timeSlot) {
      setError('Please select both a date and a time slot.');
      return;
    }
    
    if (bookedSlots.includes(timeSlot)) {
      setError('This time slot is already booked. Please select another one.');
      return;
    }

    const stored = localStorage.getItem('agromart_bookings');
    let bookings: DealBooking[] = stored ? JSON.parse(stored) : [];

    const newBooking: DealBooking = {
      id: existingBooking?.id || `bk-${Date.now()}`,
      transactionId: transaction.id,
      farmerId: transaction.farmerId,
      buyerId: transaction.buyerId,
      farmerName: transaction.farmerName,
      buyerName: transaction.buyerName,
      cropName: transaction.cropName,
      date,
      timeSlot,
      status: 'scheduled',
      createdAt: existingBooking?.createdAt || new Date().toISOString(),
    };

    if (existingBooking) {
      // Reschedule
      bookings = bookings.map(b => b.id === existingBooking.id ? newBooking : b);
    } else {
      // New booking
      bookings.push(newBooking);
    }

    localStorage.setItem('agromart_bookings', JSON.stringify(bookings));
    window.dispatchEvent(new StorageEvent('storage', { key: 'agromart_bookings' }));

    // Send notification
    const partnerName = userRole === 'farmer' ? transaction.buyerName : transaction.farmerName;
    const partnerRole = userRole === 'farmer' ? 'buyer' : 'farmer';
    const actionStr = existingBooking ? 'rescheduled' : 'scheduled';
    const msg = `Visit ${actionStr} for ${transaction.cropName} on ${new Date(date).toLocaleDateString()} at ${timeSlot}.`;
    
    const notifStr = localStorage.getItem('agromart_notifications_log');
    const logs = notifStr ? JSON.parse(notifStr) : [];
    logs.unshift({
      id: `bk-notif-${Date.now()}`,
      type: 'booking',
      text: `🗓️ ${msg}`,
      time: 'Just now',
      read: false,
      role: partnerRole
    });
    localStorage.setItem('agromart_notifications_log', JSON.stringify(logs));
    window.dispatchEvent(new StorageEvent('storage', { key: 'agromart_notifications_log', newValue: JSON.stringify(logs) }));

    onSave();
    onClose();
  };

  const getWeekday = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-earth-50/50 dark:bg-earth-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">
                {existingBooking ? 'Reschedule Visit' : 'Schedule Market Visit'}
              </h3>
              <p className="text-xs font-bold text-earth-500">
                For {transaction.cropName} deal with {userRole === 'farmer' ? transaction.buyerName : transaction.farmerName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-earth-200 dark:hover:bg-earth-800 text-earth-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-bold flex items-center gap-2 border border-red-200 dark:border-red-800/30">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-foreground flex justify-between">
              <span>Select Date</span>
              {date && <span className="text-primary-600">{getWeekday(date)}</span>}
            </label>
            <input
              type="date"
              min={minDateStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTimeSlot(''); // Reset timeslot when date changes
                setError('');
              }}
              className="px-4 py-3 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer w-full"
            />
          </div>

          {/* Time Slots */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-foreground">Select Time Slot</label>
            {!date ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-sm font-semibold text-earth-500">
                Please select a date first to view available slots.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={isBooked}
                      onClick={() => {
                        setTimeSlot(slot);
                        setError('');
                      }}
                      className={`
                        py-2.5 px-3 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2
                        ${isBooked 
                          ? 'bg-earth-100 dark:bg-earth-900 border-border text-earth-400 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20'
                            : 'bg-background border-border text-foreground hover:border-primary-400 hover:text-primary-600'
                        }
                      `}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-background flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border font-bold text-earth-600 hover:bg-earth-100 dark:hover:bg-earth-900 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!date || !timeSlot}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-500/20"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
