import { supabase } from '../lib/supabase';
import { Receipt } from '../types';

export async function fetchReceipts(): Promise<Receipt[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*, receipt_items(*)')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Receipt[];
}

export async function fetchReceipt(id: string): Promise<Receipt> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*, receipt_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Receipt;
}

export async function createReceipt(
  receipt: Omit<Receipt, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'receipt_items'>
): Promise<Receipt> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('receipts')
    .insert({ ...receipt, user_id: userData.user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Receipt;
}

export async function updateReceipt(
  id: string,
  updates: Partial<Omit<Receipt, 'id' | 'created_at' | 'user_id' | 'receipt_items'>>
): Promise<Receipt> {
  const { data, error } = await supabase
    .from('receipts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Receipt;
}

export async function deleteReceipt(id: string): Promise<void> {
  const { error } = await supabase.from('receipts').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadReceiptImage(
  userId: string,
  uri: string,
  mimeType = 'image/jpeg'
): Promise<string> {
  const fileName = `${userId}/${Date.now()}.jpg`;

  let blob: Blob;
  if (uri.startsWith('data:')) {
    const base64 = uri.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    blob = new Blob([bytes], { type: mimeType });
  } else {
    const response = await fetch(uri);
    blob = await response.blob();
  }

  const { error } = await supabase.storage.from('receipts').upload(fileName, blob, {
    contentType: mimeType,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
  return data.publicUrl;
}
