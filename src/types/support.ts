export type SupportCategory = 
  | 'account' 
  | 'crop_listing' 
  | 'offer' 
  | 'payments' 
  | 'transport' 
  | 'general';

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface TicketResponse {
  id: string;
  senderRole: 'admin' | 'user';
  senderName: string;
  text: string;
  date: string; // ISO date string
}

export interface SupportTicket {
  id: string;
  userId: string;
  userRole: 'farmer' | 'buyer';
  userName: string;
  subject: string;
  description: string;
  category: SupportCategory;
  screenshot?: string;
  status: TicketStatus;
  date: string; // ISO date string
  responses: TicketResponse[];
}
