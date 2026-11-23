import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Receipt } from '../types';
import { formatMoney } from '../utils/money';
import { formatDate } from '../utils/date';
import { StatusBadge } from './StatusBadge';

interface Props {
  receipt: Receipt;
}

export function ReceiptCard({ receipt }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/receipt/${receipt.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <Text style={styles.store} numberOfLines={1}>
          {receipt.store_name ?? 'Sem nome'}
        </Text>
        <Text style={styles.amount}>{formatMoney(receipt.total_amount)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.date}>{formatDate(receipt.date)}</Text>
        <StatusBadge status={receipt.status} />
      </View>
      {receipt.category ? <Text style={styles.category}>{receipt.category}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  store: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
  },
  category: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
