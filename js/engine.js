// Excel formül motoru — yeni.xlsx'teki formülleri birebir değerlendirir.
// Desteklenen fonksiyonlar: PI, SIN, COS, TAN, ASIN, ACOS, ATAN, DEGREES,
// TRUNC, INT, IF, VLOOKUP, MINVERSE, CONCATENATE, GCD

const ERROR_VALUES = new Set(['#REF!', '#DIV/0!', '#VALUE!', '#N/A', '#NAME?', '#NUM!', '#NULL!']);

class ExcelError {
  constructor(code) { this.code = code; }
  toString() { return this.code; }
}

// ---------- Sözcüksel çözümleme ----------
function tokenize(src) {
  const tokens = [];
  let i = 0;
  const push = (type, value) => tokens.push({ type, value });
  while (i < src.length) {
    const ch = src[i];
    if (ch === ' ' || ch === '\n' || ch === '\t') { i++; continue; }
    if (ch === '#') { // hata sabiti: #REF! vb.
      const m = src.slice(i).match(/^#[A-Z0-9/]+[!?]/);
      if (m) { push('error', m[0]); i += m[0].length; continue; }
    }
    if (ch === '"') { // metin sabiti (Excel'de "" kaçışı)
      let j = i + 1, out = '';
      while (j < src.length) {
        if (src[j] === '"' && src[j + 1] === '"') { out += '"'; j += 2; }
        else if (src[j] === '"') { j++; break; }
        else { out += src[j]; j++; }
      }
      push('string', out); i = j; continue;
    }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      const m = src.slice(i).match(/^\d*\.?\d+(?:[eE][+-]?\d+)?/);
      push('number', parseFloat(m[0])); i += m[0].length; continue;
    }
    if (/[A-Za-z$]/.test(ch)) {
      const m = src.slice(i).match(/^\$?[A-Za-z]+\$?\d*(?::\$?[A-Za-z]+\$?\d*)?/);
      const raw = m[0];
      i += raw.length;
      if (src[i] === '(') { push('func', raw.toUpperCase()); continue; }
      if (raw.includes(':')) { push('range', raw.replace(/\$/g, '')); continue; }
      const plain = raw.replace(/\$/g, '');
      if (/^[A-Z]+\d+$/i.test(plain)) { push('ref', plain.toUpperCase()); continue; }
      if (/^(TRUE|FALSE)$/i.test(plain)) { push('bool', plain.toUpperCase() === 'TRUE'); continue; }
      push('name', plain.toUpperCase()); continue;
    }
    if (ch === '<' && src[i + 1] === '=') { push('op', '<='); i += 2; continue; }
    if (ch === '>' && src[i + 1] === '=') { push('op', '>='); i += 2; continue; }
    if (ch === '<' && src[i + 1] === '>') { push('op', '<>'); i += 2; continue; }
    if ('+-*/^&<>=(),%'.includes(ch)) { push(ch === '(' || ch === ')' || ch === ',' ? ch : 'op', ch); i++; continue; }
    throw new Error(`Beklenmeyen karakter: "${ch}" @ ${i} in ${src}`);
  }
  return tokens;
}

// ---------- Sözdizim çözümleme (Pratt) ----------
function parse(src) {
  const tokens = tokenize(src);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  const BIN_PREC = { '=': 1, '<>': 1, '<': 1, '>': 1, '<=': 1, '>=': 1, '&': 2, '+': 3, '-': 3, '*': 4, '/': 4, '^': 5 };

  function parsePrimary() {
    const t = next();
    if (!t) throw new Error('Formül beklenmedik şekilde bitti: ' + src);
    if (t.type === 'number') return { t: 'num', v: t.value };
    if (t.type === 'string') return { t: 'str', v: t.value };
    if (t.type === 'bool') return { t: 'bool', v: t.value };
    if (t.type === 'error') return { t: 'err', v: t.value };
    if (t.type === 'ref') return { t: 'ref', v: t.value };
    if (t.type === 'range') return { t: 'range', v: t.value };
    if (t.type === 'func') {
      if (next()?.type !== '(') throw new Error('Fonksiyon sonrası ( bekleniyor: ' + src);
      const args = [];
      if (peek() && peek().type !== ')') {
        for (;;) {
          if (peek() && (peek().type === ',' || peek().type === ')')) {
            // boş argüman (CONCATENATE(...,) gibi)
            args.push({ t: 'str', v: '' });
          } else {
            args.push(parseExpr(0));
          }
          const n = next();
          if (!n || n.type === ')') break;
          if (n.type !== ',') throw new Error('Fonksiyon argümanında , bekleniyor: ' + src);
        }
      } else next(); // ')'
      return { t: 'call', fn: t.value, args };
    }
    if (t.type === '(') {
      const e = parseExpr(0);
      if (next()?.type !== ')') throw new Error(') bekleniyor: ' + src);
      return e;
    }
    if (t.type === 'op' && (t.value === '+' || t.value === '-')) {
      return { t: 'unary', op: t.value, e: parsePrimary() };
    }
    throw new Error(`Beklenmeyen belirteç: ${JSON.stringify(t)} in ${src}`);
  }

  function parseExpr(minPrec) {
    let left = parsePrimary();
    for (;;) {
      const t = peek();
      if (!t || t.type !== 'op') break;
      const prec = BIN_PREC[t.value];
      if (prec === undefined || prec < minPrec) break;
      next();
      const right = parseExpr(prec + 1);
      left = { t: 'bin', op: t.value, l: left, r: right };
    }
    return left;
  }

  const ast = parseExpr(0);
  if (pos < tokens.length) throw new Error('Formül tam çözümlenemedi: ' + src);
  return ast;
}

// ---------- Değer yardımcıları ----------
// Excel her ara sonucu 15 anlamlı basamağa yuvarlar (ASIN(SIN(15°))=15 tam çıkar)
function r15(x) {
  return typeof x === 'number' && Number.isFinite(x) && x !== 0
    ? parseFloat(x.toPrecision(15))
    : x;
}
function r14(x) {
  return typeof x === 'number' && Number.isFinite(x) && x !== 0
    ? parseFloat(x.toPrecision(14))
    : x;
}

function toNumber(v) {
  if (v instanceof ExcelError) return v;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isNaN(n) ? new ExcelError('#VALUE!') : n;
}

// Excel'in "genel" sayı->metin biçimi (CONCATENATE için)
export function excelText(v) {
  if (v instanceof ExcelError) return v.code;
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return String(v);
    let s = String(parseFloat(v.toPrecision(11)));
    return s;
  }
  return String(v);
}

// ---------- Motor ----------
export class Engine {
  constructor(cells, gearTable, opts = {}) {
    // vlookupMode: 'binary' = Excel ikili arama; 'scan' = Numbers (≤ anahtar en büyük değer)
    this.vlookupMode = opts.vlookupMode || 'binary';
    // round15: Numbers gibi toplama/çıkarmada da 15 basamağa yuvarla
    this.round15 = !!opts.round15;
    // cells: { 'A1': {f: 'B1+1'} | {v: 3.5} }
    this.cells = {};
    this.orig = {};
    for (const [k, e] of Object.entries(cells)) {
      this.cells[k] = { ...e };
      this.orig[k] = { ...e };
    }
    this.gearTable = gearTable; // [[A,B,C,D],...]
    this.gearRatios = gearTable.map(([a, b, c, d]) => (d ? (a / b) * (c / d) : new ExcelError('#DIV/0!')));
    this.astCache = new Map();
    this.valueCache = new Map();
    this.evaluating = new Set();
  }

  set(coord, value) {
    coord = coord.toUpperCase();
    this.cells[coord] = { v: value };
    this.valueCache.clear();
  }

  // Hücreyi Excel'deki özgün haline (formülüne) döndürür
  reset(coord) {
    coord = coord.toUpperCase();
    if (this.orig[coord]) this.cells[coord] = { ...this.orig[coord] };
    else delete this.cells[coord];
    this.valueCache.clear();
  }

  // Formüllü hücrenin üzerine elle değer yazılmış mı?
  isOverridden(coord) {
    coord = coord.toUpperCase();
    const o = this.orig[coord], c = this.cells[coord];
    return !!(o && 'f' in o && c && !('f' in c));
  }

  getRaw(coord) { return this.cells[coord.toUpperCase()]; }

  value(coord) {
    coord = coord.toUpperCase();
    if (this.valueCache.has(coord)) return this.valueCache.get(coord);
    const cell = this.cells[coord];
    let out;
    if (!cell) out = null; // boş hücre
    else if ('f' in cell) {
      if (this.evaluating.has(coord)) return new ExcelError('#REF!'); // döngü koruması
      this.evaluating.add(coord);
      try {
        let ast = this.astCache.get(coord);
        if (!ast) { ast = parse(cell.f); this.astCache.set(coord, ast); }
        out = this.evalNode(ast);
      } catch (err) {
        out = new ExcelError('#VALUE!');
      } finally {
        this.evaluating.delete(coord);
      }
      if (out === null || out === undefined) out = 0; // boş hücreye başvuran formül 0 döndürür
    } else {
      out = cell.v;
    }
    this.valueCache.set(coord, out);
    return out;
  }

  evalNode(n) {
    switch (n.t) {
      case 'num': return n.v;
      case 'str': return n.v;
      case 'bool': return n.v;
      case 'err': return new ExcelError(n.v);
      case 'ref': return this.value(n.v);
      case 'range': return { range: n.v };
      case 'unary': {
        const v = this.evalNode(n.e);
        if (v instanceof ExcelError) return v;
        if (n.op === '+') return v; // Excel'de tekli + kimlik işlecidir, metni sayıya çevirmez
        const num = toNumber(v);
        if (num instanceof ExcelError) return num;
        return -num;
      }
      case 'bin': return this.evalBin(n);
      case 'call': return this.evalCall(n);
      default: throw new Error('Bilinmeyen düğüm: ' + n.t);
    }
  }

  evalBin(n) {
    const l = this.evalNode(n.l);
    const r = this.evalNode(n.r);
    if (l instanceof ExcelError) return l;
    if (r instanceof ExcelError) return r;
    const op = n.op;
    if (op === '&') return excelText(l) + excelText(r);
    if (op === '=' || op === '<>' || op === '<' || op === '>' || op === '<=' || op === '>=') {
      const a = typeof l === 'string' ? l : toNumber(l);
      const b = typeof r === 'string' ? r : toNumber(r);
      switch (op) {
        case '=': return a === b;
        case '<>': return a !== b;
        case '<': return a < b;
        case '>': return a > b;
        case '<=': return a <= b;
        case '>=': return a >= b;
      }
    }
    const a = toNumber(l), b = toNumber(r);
    if (a instanceof ExcelError) return a;
    if (b instanceof ExcelError) return b;
    switch (op) {
      // Numbers modu: toplama/çıkarmada 14 basamağa yuvarla (Numbers 32.4-32 = tam 0.4 verir)
      case '+': return this.round15 ? r14(a + b) : a + b;
      case '-': return this.round15 ? r14(a - b) : a - b;
      case '*': return r15(a * b);
      case '/': return b === 0 ? new ExcelError('#DIV/0!') : r15(a / b);
      case '^': return r15(Math.pow(a, b));
    }
    throw new Error('Bilinmeyen işleç: ' + op);
  }

  evalCall(n) {
    const F = n.fn;
    const arg = (i) => this.evalNode(n.args[i]);
    const num = (i) => {
      const v = arg(i);
      return v instanceof ExcelError ? v : toNumber(v);
    };
    switch (F) {
      case 'PI': return Math.PI;
      case 'SIN': case 'COS': case 'TAN': case 'ASIN': case 'ACOS': case 'ATAN': {
        const v = num(0);
        if (v instanceof ExcelError) return v;
        const fn = { SIN: Math.sin, COS: Math.cos, TAN: Math.tan, ASIN: Math.asin, ACOS: Math.acos, ATAN: Math.atan }[F];
        const out = fn(v);
        return Number.isNaN(out) ? new ExcelError('#NUM!') : r15(out);
      }
      case 'DEGREES': {
        const v = num(0);
        return v instanceof ExcelError ? v : r15(v * 180 / Math.PI);
      }
      case 'TRUNC': {
        const v = num(0);
        if (v instanceof ExcelError) return v;
        const digits = n.args.length > 1 ? num(1) : 0;
        if (digits instanceof ExcelError) return digits;
        const p = Math.pow(10, digits);
        return Math.trunc(v * p) / p;
      }
      case 'INT': {
        const v = num(0);
        return v instanceof ExcelError ? v : Math.floor(v);
      }
      case 'IF': {
        const c = arg(0);
        if (c instanceof ExcelError) return c;
        const truthy = typeof c === 'string' ? c !== '' : toNumber(c) !== 0;
        return truthy ? arg(1) : (n.args.length > 2 ? arg(2) : false);
      }
      case 'MINVERSE': { // sayfada yalnızca 1x1 kullanılıyor -> 1/x
        const v = num(0);
        if (v instanceof ExcelError) return v;
        return v === 0 ? new ExcelError('#DIV/0!') : 1 / v;
      }
      case 'CONCATENATE': {
        let out = '';
        for (let i = 0; i < n.args.length; i++) {
          const v = arg(i);
          if (v instanceof ExcelError) return v;
          out += excelText(v);
        }
        return out;
      }
      case 'GCD': {
        const a = num(0), b = num(1);
        if (a instanceof ExcelError) return a;
        if (b instanceof ExcelError) return b;
        let x = Math.trunc(Math.abs(a)), y = Math.trunc(Math.abs(b));
        while (y) { [x, y] = [y, x % y]; }
        return x;
      }
      case 'SUM': {
        let total = 0;
        for (const a of n.args) {
          const v = this.evalNode(a);
          if (v instanceof ExcelError) return v;
          if (v && v.range) {
            const m = String(v.range).match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
            if (!m) return new ExcelError('#REF!');
            const [, c1, r1, c2, r2] = m;
            const colIdx = (s) => s.split('').reduce((acc, ch) => acc * 26 + ch.charCodeAt(0) - 64, 0);
            const colStr = (i) => { let s = ''; while (i) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = (i - 1 - r) / 26; } return s; };
            for (let ci = colIdx(c1); ci <= colIdx(c2); ci++) {
              for (let ri = +r1; ri <= +r2; ri++) {
                const cv = this.value(colStr(ci) + ri);
                if (cv instanceof ExcelError) return cv;
                if (typeof cv === 'number') total += cv;
              }
            }
          } else if (typeof v === 'number') total += v;
          else if (typeof v === 'boolean') total += v ? 1 : 0;
        }
        return this.round15 ? r15(total) : total;
      }
      case 'VLOOKUP': return this.vlookup(n);
      default: throw new Error('Desteklenmeyen fonksiyon: ' + F);
    }
  }

  // Excel yaklaşık eşleşme (TRUE) ikili araması — BH:BL tablosuna özel
  vlookup(n) {
    const key = this.evalNode(n.args[0]);
    if (key instanceof ExcelError) return key;
    const rangeV = this.evalNode(n.args[1]);
    const colV = this.evalNode(n.args[2]);
    // Çark oranı tablosu: xlsx'te BH:BL, Numbers'ta P:T — ikisi de aynı tablo
    const rng = rangeV && rangeV.range ? String(rangeV.range) : '';
    if (!rng.startsWith('BH') && !rng.startsWith('P')) {
      return new ExcelError('#REF!');
    }
    const col = toNumber(colV); // 1=oran, 2=A, 3=B, 4=C, 5=D
    const k = toNumber(key);
    if (k instanceof ExcelError || col instanceof ExcelError) return new ExcelError('#VALUE!');
    const ratios = this.gearRatios;
    let found = -1;
    if (this.vlookupMode === 'scan') {
      // Numbers VLOOKUP(yaklaşık): sıradan bağımsız, anahtardan küçük-eşit EN BÜYÜK değer
      let best = -Infinity;
      for (let i = 0; i < ratios.length; i++) {
        const rv = ratios[i];
        if (rv instanceof ExcelError) continue;
        if (rv <= k && rv >= best) { best = rv; found = i; }
      }
    } else {
      // Excel VLOOKUP(TRUE): sıralı varsayımla ikili arama, k'den küçük-eşit son satır
      let lo = 0, hi = ratios.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const rv = ratios[mid];
        const rnum = rv instanceof ExcelError ? Infinity : rv;
        if (rnum <= k) { found = mid; lo = mid + 1; }
        else { hi = mid - 1; }
      }
    }
    if (found < 0) return new ExcelError('#N/A');
    if (col === 1) return ratios[found];
    const row = this.gearTable[found];
    const v = row[col - 2];
    return v === null || v === undefined ? 0 : v;
  }
}

export { ExcelError };
