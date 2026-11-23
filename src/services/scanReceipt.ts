import { supabase } from '../lib/supabase';
import { ReceiptItem } from '../types';

export interface ScanResult {
  store_name: string | null;
  date: string | null;
  total_amount: number | null;
  category: string | null;
  items: Omit<ReceiptItem, 'id' | 'receipt_id'>[];
  raw_text: string | null;
}

export async function scanReceipt(base64Image: string, mimeType = 'image/jpeg'): Promise<ScanResult> {
  const { data, error } = await supabase.functions.invoke('scan-receipt', {
    body: { image: base64Image, mimeType },
  });

  if (error) throw error;
  if (!data) throw new Error('Resposta vazia do servidor');

  return data as ScanResult;
}
