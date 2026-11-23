export type ReceiptStatus = 'pending' | 'processing' | 'done' | 'error';

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Receipt {
  id: string;
  user_id: string;
  image_path: string;
  status: ReceiptStatus;
  merchant: string | null;
  date: string | null;
  total: number | null;
  category: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  items?: ReceiptItem[];
}

export type YearMonth = string;

export interface MonthlySummary {
  total: number;
  count: number;
  average: number;
  byCategory: Record<string, number>;
  percentage: Record<string, number>;
}
