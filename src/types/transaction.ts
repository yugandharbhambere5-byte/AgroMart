export interface Transaction {
  id: string;
  cropId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  date: string;
  status: 'Completed' | 'Pending';
}
