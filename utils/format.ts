export function formatIdr(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)} jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  return `Rp ${value.toFixed(0)}`;
}

export function formatIdrFull(value: number): string {
  const hasFraction = value % 1 !== 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUsd(valueIdr: number, rate: number): string {
  const usd = valueIdr / rate;
  return `≈ $${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}
