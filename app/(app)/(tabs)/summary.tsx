import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchReceipts } from '../../../src/services/receipts';
import { computeSummary } from '../../../src/utils/summary';
import { formatMoney } from '../../../src/utils/money';
import { currentYearMonth, monthLabel, prevMonth, nextMonth } from '../../../src/utils/date';

export default function SummaryScreen() {
  const now = currentYearMonth();
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceipts,
  });

  const summary = computeSummary(receipts ?? [], year, month);

  function goPrev() {
    const p = prevMonth(year, month);
    setYear(p.year);
    setMonth(p.month);
  }

  function goNext() {
    const n = nextMonth(year, month);
    setYear(n.year);
    setMonth(n.month);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo Mensal</Text>
      </View>

      {/* Month navigator */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={goPrev} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel(year, month)}</Text>
        <TouchableOpacity onPress={goNext} style={styles.navBtn}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Total card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total do mês</Text>
        <Text style={styles.totalAmount}>{isLoading ? '...' : formatMoney(summary.total)}</Text>
        <Text style={styles.totalCount}>{summary.count} comprovante{summary.count !== 1 ? 's' : ''}</Text>
      </View>

      {/* By category */}
      {Object.keys(summary.byCategory).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por Categoria</Text>
          {Object.entries(summary.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amount]) => (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catAmount}>{formatMoney(amount)}</Text>
              </View>
            ))}
        </View>
      )}

      {summary.count === 0 && !isLoading && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyText}>Nenhum comprovante neste mês</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingBottom: 32 },
  header: {
    padding: 20,
    paddingTop: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 28, color: '#059669', fontWeight: '700' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: '#111827', textTransform: 'capitalize' },
  totalCard: {
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: { fontSize: 14, color: '#A7F3D0', fontWeight: '600', marginBottom: 8 },
  totalAmount: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  totalCount: { fontSize: 13, color: '#D1FAE5', marginTop: 6 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  catName: { fontSize: 15, color: '#374151' },
  catAmount: { fontSize: 15, fontWeight: '600', color: '#059669' },
  empty: { alignItems: 'center', paddingTop: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
});
