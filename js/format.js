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

// Hata değerleri için bilimsel gösterim: 0,0000445 -> "4,45·10⁻⁵"
const SUPER = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
export function fmtSci(v) {
  if (v instanceof ExcelError) return '—';
  if (typeof v !== 'number' || !Number.isFinite(v)) return '—';
  if (v === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(v)));
  const mant = v / Math.pow(10, exp);
  const mantStr = mant.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
  const expStr = String(exp).split('').map(ch => SUPER[ch] || ch).join('');
  return `${mantStr}·10${expStr}`;
}

// Girdi kutusundan sayı oku (virgül de kabul et)
export function parseInput(str) {
  if (str === null || str === undefined) return null;
  const s = String(str).trim().replace(',', '.');
  if (s === '') return null;
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

// Ondalık dereceyi derece/dakika/saniyeye ayır (Excel'deki TRUNC tabanlı
// DMS gösterimiyle aynı yaklaşım — G20/G23/G26 formülleri)
export function decToDms(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return { d: '', m: '', s: '' };
  const d = Math.trunc(v);
  const mFull = (v - d) * 60;
  const m = Math.trunc(mFull);
  const s = Math.round((mFull - m) * 60 * 100) / 100;
  return { d, m, s };
}

// Derece/dakika/saniyeyi ondalık dereceye çevir
export function dmsToDec(d, m, s) {
  return d + m / 60 + s / 3600;
}
