import { Receipt, MonthlySummary } from '../types';

export function computeSummary(receipts: Receipt[], year: number, month: number): MonthlySummary {
  const filtered = receipts.filter((r) => {
    if (!r.date) return false;
    const [y, m] = r.date.split('-').map(Number);
    return y === year && m === month;
  });

  const total = filtered.reduce((acc, r) => acc + (r.total_amount ?? 0), 0);
  const count = filtered.length;

  const byCategory: Record<string, number> = {};
  for (const r of filtered) {
    const cat = r.category ?? 'Outros';
    byCategory[cat] = (byCategory[cat] ?? 0) + (r.total_amount ?? 0);
  }

  return { year, month, total, count, byCategory };
}
