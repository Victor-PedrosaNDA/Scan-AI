export function formatMoney(cents: number | null | undefined): string {
  if (cents == null) return 'R$ -';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function parseMoney(value: string): number {
  const clean = value.replace(/[^\d,]/g, '').replace(',', '.');
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function roundMoney(cents: number): number {
  return Math.round(cents);
}

export function toInputMoney(cents: number | null | undefined): string {
  if (cents == null) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}
