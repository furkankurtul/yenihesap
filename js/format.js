// Sayı biçimleme — Türkçe ondalık virgül
import { ExcelError } from './engine.js';

export function fmt(v, decimals = 6) {
  if (v instanceof ExcelError) return '—';
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return '—';
    let s;
    if (Number.isInteger(v) && Math.abs(v) < 1e15) s = String(v);
    else s = v.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
    return s.replace('.', ',');
  }
  return String(v);
}

// Girdi kutusundan sayı oku (virgül de kabul et)
export function parseInput(str) {
  if (str === null || str === undefined) return null;
  const s = String(str).trim().replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}
