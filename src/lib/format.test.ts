import { describe, expect, it } from 'vitest';
import { formatDate, formatKg, formatNumber, formatPct, formatPoints, formatSek, NBSP } from './format';

describe('format', () => {
  it('formats prices the IKEA way with a non-breaking space', () => {
    expect(formatSek(1299)).toBe(`1${NBSP}299:-`);
    expect(formatSek(699)).toBe('699:-');
    expect(formatSek(1234567)).toBe(`1${NBSP}234${NBSP}567:-`);
    expect(formatSek(0)).toBe('0:-');
  });

  it('formats numbers and negative numbers', () => {
    expect(formatNumber(1240)).toBe(`1${NBSP}240`);
    expect(formatNumber(-1500)).toBe(`-1${NBSP}500`);
  });

  it('formats percentages, kilograms and points', () => {
    expect(formatPct(12)).toBe(`12${NBSP}%`);
    expect(formatPct(12.345)).toBe(`12.3${NBSP}%`);
    expect(formatKg(3.75)).toBe(`3.8${NBSP}kg`);
    expect(formatPoints(1)).toBe('1 point');
    expect(formatPoints(1240)).toBe(`1${NBSP}240 points`);
  });

  it('formats dates as YYYY-MM-DD', () => {
    expect(formatDate('2026-09-02T10:00:00')).toBe('2026-09-02');
  });
});
