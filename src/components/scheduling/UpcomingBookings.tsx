import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronRight, Edit3 } from 'lucide-react';
import { DealBooking } from '@/types/booking';
import { Transaction } from '@/types/transaction';
import { ScheduleModal } from './ScheduleModal';

interface UpcomingBookingsProps {
  userRole: 'farmer' | 'buyer';
  userId?: string;
}

export function UpcomingBookings({ userRole, userId }: UpcomingBookingsProps) {
  const [bookings, setBookings] = useState<DealBooking[]>([]);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<DealBooking | null>(null);

  const loadBookings = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agromart_bookings');
      if (stored) {
        const parsed: DealBooking[] = JSON.parse(stored);
        
        // Filter for active bookings belonging to this user
        const activeUserBookings = parsed.filter(b => 
          b.status === 'scheduled' && 
          (userRole === 'farmer' ? b.farmerId === userId : b.buyerId === userId)
        );

        // Sort by date approaching
        const sorted = activeUserBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setBookings(sorted);
      }
    }
  };

  useEffect(() => {
    loadBookings();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agromart_bookings') {
        loadBookings();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [userRole, userId]);

  const handleReschedule = (booking: DealBooking) => {
    setSelectedBooking(booking);
    setIsRescheduleOpen(true);
  };

  // Build a dummy transaction object to pass to ScheduleModal for rescheduling
  const getDummyTransactionForBooking = (b: DealBooking): Transaction => ({
    id: b.transactionId,
    cropId: '',
    cropName: b.cropName,
    farmerId: b.farmerId,
    farmerName: b.farmerName,
    buyerId: b.buyerId,
    buyerName: b.buyerName,
    quantity: 0,
    unit: '',
    pricePerUnit: 0,
    totalAmount: 0,
    date: b.date,
    status: 'Completed'
  });

  if (bookings.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mb-8 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <CalendarIcon className="w-4 h-4" />
        </div>
        <h2 className="text-xl font-black text-foreground">Upcoming Visits</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => {
          const partnerName = userRole === 'farmer' ? booking.buyerName : booking.farmerName;
          const dateObj = new Date(booking.date);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

          return (
            <div key={booking.id} className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-earth-500 mb-1">
                    {weekday}, {formattedDate}
                  </span>
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    {booking.timeSlot}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-black uppercase">
                  Scheduled
                </span>
              </div>

              <div className="flex flex-col gap-2 p-3 rounded-xl bg-earth-50 dark:bg-earth-900/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <User className="w-4 h-4 text-earth-400" />
                  <span>Meeting with <span className="font-extrabold">{partnerName}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="w-4 h-4 text-earth-400" />
                  <span>Crop: <span className="font-extrabold">{booking.cropName}</span></span>
                </div>
              </div>

              <button
                onClick={() => handleReschedule(booking)}
                className="w-full py-2.5 rounded-xl border border-border bg-background hover:bg-earth-100 dark:hover:bg-earth-800 text-sm font-extrabold text-earth-600 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Reschedule
              </button>
            </div>
          );
        })}
      </div>

      {isRescheduleOpen && selectedBooking && (
        <ScheduleModal
          transaction={getDummyTransactionForBooking(selectedBooking)}
          userRole={userRole}
          existingBooking={selectedBooking}
          onClose={() => {
            setIsRescheduleOpen(false);
            setSelectedBooking(null);
          }}
          onSave={loadBookings}
        />
      )}
    </div>
  );
}
