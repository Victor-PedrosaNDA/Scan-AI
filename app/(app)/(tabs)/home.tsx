import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { fetchReceipts } from '../../../src/services/receipts';
import { ReceiptCard } from '../../../src/components/ReceiptCard';
import { Receipt } from '../../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { data: receipts, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceipts,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comprovantes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(app)/(tabs)/scan')}>
          <Text style={styles.addBtnText}>+ Escanear</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : !receipts?.length ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyTitle}>Nenhum comprovante</Text>
          <Text style={styles.emptyText}>Escaneie seu primeiro comprovante!</Text>
          <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/(app)/(tabs)/scan')}>
            <Text style={styles.scanBtnText}>Escanear agora</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={receipts}
          keyExtractor={(item: Receipt) => item.id}
          renderItem={({ item }) => <ReceiptCard receipt={item} />}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#059669" />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  addBtn: { backgroundColor: '#059669', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { color: '#6B7280', fontSize: 16 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  scanBtn: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  scanBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  list: { paddingVertical: 8 },
});
