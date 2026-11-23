import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { pickFromGallery, pickFromCamera, imageToBase64, PickedImage } from '../../../src/services/imagePicker';
import { scanReceipt } from '../../../src/services/scanReceipt';
import { createReceipt, uploadReceiptImage } from '../../../src/services/receipts';
import { ReceiptForm } from '../../../src/components/ReceiptForm';
import { Receipt } from '../../../src/types';
import { supabase } from '../../../src/lib/supabase';

type Step = 'pick' | 'scanning' | 'review';

export default function ScanScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [step, setStep] = useState<Step>('pick');
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [scanResult, setScanResult] = useState<Partial<Receipt> | null>(null);
  const [saving, setSaving] = useState(false);

  async function handlePick(source: 'gallery' | 'camera') {
    try {
      const img = source === 'gallery' ? await pickFromGallery() : await pickFromCamera();
      if (!img) return;
      setPicked(img);
      setStep('scanning');

      const base64 = imageToBase64(img);
      const result = await scanReceipt(base64, img.mimeType);
      setScanResult({
        store_name: result.store_name ?? '',
        date: result.date ?? undefined,
        total_amount: result.total_amount ?? 0,
        category: result.category ?? '',
        raw_text: result.raw_text ?? '',
        status: 'pending',
      });
      setStep('review');
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível escanear o comprovante.');
      setStep('pick');
    }
  }

  async function handleSave(formData: Omit<Receipt, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'receipt_items'>) {
    setSaving(true);
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;

      let imageUrl: string | null = null;
      if (picked && userId) {
        try {
          imageUrl = await uploadReceiptImage(userId, picked.uri, picked.mimeType);
        } catch {
          // image upload failure is non-fatal
        }
      }

      await createReceipt({ ...formData, image_url: imageUrl });
      await queryClient.invalidateQueries({ queryKey: ['receipts'] });
      Alert.alert('Sucesso', 'Comprovante salvo!', [
        { text: 'OK', onPress: () => { setStep('pick'); setPicked(null); setScanResult(null); router.replace('/(app)/(tabs)/home'); } },
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (step === 'scanning') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.scanningText}>Analisando comprovante com IA...</Text>
      </View>
    );
  }

  if (step === 'review' && scanResult) {
    return (
      <View style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Revisar Comprovante</Text>
          <TouchableOpacity onPress={() => { setStep('pick'); setPicked(null); setScanResult(null); }}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
        {picked && (
          <Image source={{ uri: picked.uri }} style={styles.preview} resizeMode="contain" />
        )}
        <ReceiptForm initialValues={scanResult} onSubmit={handleSave} loading={saving} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escanear Comprovante</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.pickEmoji}>📷</Text>
        <Text style={styles.pickTitle}>Adicionar Comprovante</Text>
        <Text style={styles.pickSub}>Tire uma foto ou escolha da galeria</Text>

        <View style={styles.btnGroup}>
          {Platform.OS !== 'web' && (
            <TouchableOpacity style={styles.optionBtn} onPress={() => handlePick('camera')}>
              <Text style={styles.optionEmoji}>📸</Text>
              <Text style={styles.optionLabel}>Câmera</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.optionBtn} onPress={() => handlePick('gallery')}>
            <Text style={styles.optionEmoji}>🖼️</Text>
            <Text style={styles.optionLabel}>Galeria</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  cancelText: { color: '#DC2626', fontSize: 15, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  scanningText: { marginTop: 20, fontSize: 16, color: '#6B7280', textAlign: 'center' },
  pickEmoji: { fontSize: 72, marginBottom: 16 },
  pickTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  pickSub: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  btnGroup: { flexDirection: 'row', gap: 16 },
  optionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionEmoji: { fontSize: 40, marginBottom: 8 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  preview: { width: '100%', height: 180, backgroundColor: '#E5E7EB' },
});
