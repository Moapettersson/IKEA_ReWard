// Number and price formatting, the IKEA Sweden way: 1 299:- with a non-breaking space.
export const NBSP = ' ';

export function formatNumber(value: number): string {
  const sign = value < 0 ? '-' : '';
  const digits = Math.abs(Math.trunc(value)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

export function formatSek(value: number): string {
  return `${formatNumber(value)}:-`;
}

export function formatPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toString()}${NBSP}%`;
}

export function formatKg(value: number): string {
  return `${(Math.round(value * 10) / 10).toFixed(1)}${NBSP}kg`;
}

export function formatPoints(value: number): string {
  return `${formatNumber(value)} ${value === 1 ? 'point' : 'points'}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
