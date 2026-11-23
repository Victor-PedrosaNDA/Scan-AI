import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const [saindo, setSaindo] = useState(false);

  async function handleLogout() {
    if (saindo) return;
    setSaindo(true);
    try {
      await signOut();
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível sair.');
      setSaindo(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={styles.email}>{session?.user?.email ?? '-'}</Text>
        <Text style={styles.userId}>ID: {session?.user?.id?.slice(0, 8)}...</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <TouchableOpacity style={styles.row} onPress={handleLogout} disabled={saindo}>
          <Text style={styles.rowLabel}>{saindo ? '⏳  Saindo...' : '🚪  Sair'}</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>ScanIA v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    padding: 20,
    paddingTop: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 36 },
  email: { fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 4 },
  userId: { fontSize: 12, color: '#9CA3AF' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#6B7280', padding: 12, paddingBottom: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 16, color: '#DC2626' },
  rowArrow: { fontSize: 20, color: '#9CA3AF' },
  version: { textAlign: 'center', marginTop: 32, fontSize: 12, color: '#D1D5DB' },
});