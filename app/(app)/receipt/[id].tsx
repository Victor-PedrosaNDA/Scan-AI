import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReceipt, deleteReceipt, updateReceipt } from '../../../src/services/receipts';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { ReceiptForm } from '../../../src/components/ReceiptForm';
import { formatMoney } from '../../../src/utils/money';
import { formatDateLong } from '../../../src/utils/date';
import { Receipt } from '../../../src/types';

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: receipt, isLoading, error } = useQuery({
    queryKey: ['receipt', id],
    queryFn: () => fetchReceipt(id!),
    enabled: !!id,
  });

  async function handleDelete() {
    Alert.alert('Excluir', 'Deseja excluir este comprovante?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReceipt(id!);
            await queryClient.invalidateQueries({ queryKey: ['receipts'] });
            router.back();
          } catch (err: any) {
            Alert.alert('Erro', err.message);
          }
        },
      },
    ]);
  }

  async function handleSave(formData: Omit<Receipt, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'receipt_items'>) {
    setSaving(true);
    try {
      await updateReceipt(id!, formData);
      await queryClient.invalidateQueries({ queryKey: ['receipts'] });
      await queryClient.invalidateQueries({ queryKey: ['receipt', id] });
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>;
  }

  if (error || !receipt) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Comprovante não encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (editing) {
    return (
      <View style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setEditing(false)}>
            <Text style={styles.backText}>‹ Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar</Text>
          <View style={{ width: 70 }} />
        </View>
        <ReceiptForm initialValues={receipt} onSubmit={handleSave} loading={saving} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comprovante</Text>
        <TouchableOpacity onPress={() => setEditing(true)}>
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {receipt.image_url && (
          <Image source={{ uri: receipt.image_url }} style={styles.image} resizeMode="contain" />
        )}

        <View style={styles.card}>
          <Text style={styles.storeName}>{receipt.store_name ?? 'Sem nome'}</Text>
          <Text style={styles.amount}>{formatMoney(receipt.total_amount)}</Text>
          <StatusBadge status={receipt.status} />
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="Data" value={formatDateLong(receipt.date)} />
          {receipt.category && <InfoRow label="Categoria" value={receipt.category} />}
          {receipt.notes && <InfoRow label="Notas" value={receipt.notes} />}
        </View>

        {receipt.receipt_items && receipt.receipt_items.length > 0 && (
          <View style={styles.itemsCard}>
            <Text style={styles.sectionTitle}>Itens</Text>
            {receipt.receipt_items.map((item, i) => (
              <View key={item.id ?? i} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemAmount}>{formatMoney(item.total_price)}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>🗑️  Excluir comprovante</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 16 },
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 54,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  backText: { color: '#059669', fontSize: 16, fontWeight: '600', width: 70 },
  editText: { color: '#059669', fontSize: 16, fontWeight: '600', textAlign: 'right', width: 70 },
  content: { paddingBottom: 40 },
  image: { width: '100%', height: 200, backgroundColor: '#E5E7EB', marginBottom: 8 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    gap: 8,
  },
  storeName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  amount: { fontSize: 28, fontWeight: '800', color: '#059669' },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemName: { fontSize: 14, color: '#374151', flex: 1 },
  itemAmount: { fontSize: 14, color: '#059669', fontWeight: '600' },
  deleteBtn: { margin: 16, padding: 16, backgroundColor: '#FEE2E2', borderRadius: 12, alignItems: 'center' },
  deleteBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
  errorText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  backBtn: { backgroundColor: '#059669', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { color: '#FFFFFF', fontWeight: '600' },
});
