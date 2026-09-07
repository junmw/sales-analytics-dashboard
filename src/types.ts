export interface SaleRecord {
  id: string;
  orderNumber: string;
  product: string;
  price: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
}

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'eWallet' | 'Cash';

export type VisualizationView = 
  | 'overview'
  | 'trends'
  | 'products'
  | 'payments'
  | 'calendar'
  | 'orders'
  | 'ledger';

export interface FilterState {
  dateRange: 'all' | '2025-08' | '2025-09' | '2025-10' | 'custom';
  startDate?: string;
  endDate?: string;
  paymentMethods: PaymentMethod[];
  products: string[];
  searchQuery: string;
  minPrice?: number;
  maxPrice?: number;
}
