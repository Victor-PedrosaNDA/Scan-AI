import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReceiptStatus } from '../types';

interface Props {
  status: ReceiptStatus;
}

const config: Record<ReceiptStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendente', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Confirmado', bg: '#D1FAE5', text: '#065F46' },
  rejected: { label: 'Rejeitado', bg: '#FEE2E2', text: '#991B1B' },
};

export function StatusBadge({ status }: Props) {
  const { label, bg, text } = config[status] ?? config.pending;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
