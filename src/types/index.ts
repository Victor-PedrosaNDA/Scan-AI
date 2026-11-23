export type ReceiptStatus = 'pending' | 'confirmed' | 'rejected';

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
}

export interface Receipt {
  id: string;
  user_id: string;
  store_name: string | null;
  date: string | null;
  total_amount: number | null;
  category: string | null;
  status: ReceiptStatus;
  image_url: string | null;
  raw_text: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  receipt_items?: ReceiptItem[];
}

export interface MonthlySummary {
  year: number;
  month: number;
  total: number;
  count: number;
  byCategory: Record<string, number>;
}

export interface YearMonth {
  year: number;
  month: number;
}