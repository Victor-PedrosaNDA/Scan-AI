import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Receipt, ReceiptItem } from '../types';
import { parseMoney, toInputMoney } from '../utils/money';
import { todayISO } from '../utils/date';

const schema = z.object({
  store_name: z.string().min(1, 'Nome da loja é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  total_amount_input: z.string().min(1, 'Total é obrigatório'),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialValues?: Partial<Receipt>;
  items?: Omit<ReceiptItem, 'id' | 'receipt_id'>[];
  onSubmit: (data: Omit<Receipt, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'receipt_items'>) => void;
  loading?: boolean;
}

export function ReceiptForm({ initialValues, onSubmit, loading }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      store_name: initialValues?.store_name ?? '',
      date: initialValues?.date ?? todayISO(),
      total_amount_input: toInputMoney(initialValues?.total_amount ?? null),
      category: initialValues?.category ?? '',
      notes: initialValues?.notes ?? '',
    },
  });

  function submit(values: FormData) {
    onSubmit({
      store_name: values.store_name,
      date: values.date,
      total_amount: parseMoney(values.total_amount_input),
      category: values.category || null,
      notes: values.notes || null,
      status: initialValues?.status ?? 'pending',
      image_url: initialValues?.image_url ?? null,
      raw_text: initialValues?.raw_text ?? null,
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Field label="Loja *" error={errors.store_name?.message}>
        <Controller
          control={control}
          name="store_name"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput style={styles.input} value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Ex: Supermercado" />
          )}
        />
      </Field>

      <Field label="Data *" error={errors.date?.message}>
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="AAAA-MM-DD"
              {...(Platform.OS === 'web' ? { type: 'date' } as any : {})}
            />
          )}
        />
      </Field>

      <Field label="Total (R$) *" error={errors.total_amount_input?.message}>
        <Controller
          control={control}
          name="total_amount_input"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput style={styles.input} value={value} onChangeText={onChange} onBlur={onBlur} placeholder="0,00" keyboardType="decimal-pad" />
          )}
        />
      </Field>

      <Field label="Categoria" error={undefined}>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput style={styles.input} value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Ex: Alimentação" />
          )}
        />
      </Field>

      <Field label="Observações" error={undefined}>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput style={[styles.input, styles.textarea]} value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Notas adicionais" multiline numberOfLines={3} />
          )}
        />
      </Field>

      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSubmit(submit)} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  btn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  error: { color: '#DC2626', fontSize: 12, marginTop: 4 },
});
