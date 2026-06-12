export interface DealBooking {
  id: string;
  transactionId: string;
  farmerId: string;
  buyerId: string;
  farmerName: string;
  buyerName: string;
  cropName: string;
  date: string; // ISO format YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 AM - 11:00 AM"
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string; // ISO string
}
