// Dişli Hesap — uygulama: yönlendirme + ekran çizimi + canlı hesap
import { Engine } from './engine.js';
import { CELLS } from '../data/cells.js';
import { CELLS_2026 } from '../data/cells2026.js';
import { GEAR_TABLE } from '../data/gears.js';
import { ZST } from '../data/zst.js';
import { fmt, fmtSci, parseInput } from './format.js';
import { CARK_VARIANTS, MODULES, HOME_ITEMS } from './modules.js';
import { findGears } from './optimizer.js';
import { listJobs, saveJob, deleteJob } from './storage.js';

// Üç hücre deposu: xlsx (yeni.xlsx), copy (Yeni Makine için bağımsız kopya),
// n2026 (2026 OCAK.numbers — Numbers'ın VLOOKUP/yuvarlama davranışıyla)
const eng = new Engine(CELLS, GEAR_TABLE);
const STORES = {
  xlsx: eng,
  copy: new Engine(CELLS, GEAR_TABLE),
  n2026: new Engine(CELLS_2026, GEAR_TABLE, { vlookupMode: 'scan', round15: true }),
};

const app = document.getElementById('app');
const titleEl = document.getElementById('page-title');

// ---------- yardımcılar ----------
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) {
    if (c === null || c === undefined) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

function inputField(E, def, onChange) {
  const cur = E.value(def.cell);
  const input = el('input', {
    type: 'text', inputmode: 'decimal',
    value: typeof cur === 'number' ? String(cur).replace('.', ',') : '',
    oninput: (e) => {
      const n = parseInput(e.target.value);
      if (n !== null) { E.set(def.cell, n); onChange(); }
    },
  });
  const label = el('label', {}, def.label + ' ');
  if (def.unit) label.append(el('span', { class: 'unit' }, def.unit));
  return el('div', { class: 'field' }, label, input);
}

function resultRow(name, value, { big = false, dec = 6, err = false, sci = false } = {}) {
  return el('div', { class: 'result-row' },
    el('span', { class: 'name' }, name),
    el('span', { class: 'val' + (big ? ' big' : '') + (err ? ' err' : '') },
      sci ? fmtSci(value) : fmt(value, dec)));
}

function foldSection(title, ...children) {
  return el('details', { class: 'geometry' }, el('summary', {}, title), ...children);
}

// ---------- iş kaydı (yalnız Çark Hesabı) ----------
function saveSection(variant, E, cellsToSave) {
  const msg = el('span', { class: 'save-msg' });
  const nameInput = el('input', { type: 'text', placeholder: 'İş adı (örn: 71 diş helis)' });
  const noteInput = el('textarea', { rows: '3', placeholder: 'Not (opsiyonel) — malzeme, müşteri, ölçü notu…' });
  const btn = el('button', {
    class: 'btn',
    onclick: () => {
      if (!nameInput.value.trim()) { nameInput.focus(); return; }
      const inputs = {};
      for (const cell of cellsToSave) {
        const v = E.value(cell);
        if (typeof v === 'number') inputs[cell] = v;
      }
      saveJob({
        name: nameInput.value, route: 'cark',
        moduleTitle: 'Çark Hesabı · ' + variant.title,
        variant: variant.id, inputs,
        note: noteInput.value.trim() || null,
      });
      msg.textContent = 'Kaydedildi ✓';
      nameInput.value = ''; noteInput.value = '';
      setTimeout(() => { msg.textContent = ''; }, 2500);
    },
  }, 'Kaydet');
  return el('div', { class: 'results' },
    el('h3', { class: 'label-caps' }, 'İşi kaydet'),
    el('div', { class: 'save-row' },
      el('div', { class: 'field' }, el('label', {}, 'İş adı'), nameInput), btn, msg),
    el('div', { class: 'field', style: 'margin-top:16px' },
      el('label', {}, 'Not ', el('span', { class: 'unit' }, 'opsiyonel')), noteInput));
}

function renderJobs() {
  titleEl.textContent = 'Kayıtlı İşler';
  const jobs = listJobs();
  const wrap = el('div');
  if (!jobs.length) {
    wrap.append(el('p', { class: 'note' },
      'Henüz kayıtlı iş yok. Çark Hesabı ekranının altındaki "İşi kaydet" bölümünü kullan.'));
  }
  for (const job of jobs) {
    const date = new Date(job.ts).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
    const meta = el('div', { class: 'meta' }, `${job.moduleTitle} — ${date}`);
    const row = el('div', { class: 'job-row' },
      el('div', {},
        el('div', { class: 'name' }, job.name),
        meta,
        job.note ? el('div', { class: 'meta' }, '🗒 ' + job.note) : null),
      el('div', { class: 'actions' },
        el('button', {
          class: 'btn ghost',
          onclick: () => {
            const variant = CARK_VARIANTS.find(v => v.id === job.variant);
            const E = variant ? STORES[variant.store] : eng;
            for (const [cell, v] of Object.entries(job.inputs)) E.set(cell, v);
            if (job.variant && variant) activeVariant = job.variant;
            location.hash = '#' + job.route;
            if (('#' + job.route) === location.hash) route();
          },
        }, 'Aç'),
        el('button', {
          class: 'btn danger',
          onclick: () => { deleteJob(job.id); renderJobs(); },
        }, 'Sil')));
    wrap.append(row);
  }
  app.replaceChildren(
    el('p', { class: 'label-caps' }, 'Yerel kayıtlar'),
    el('h2', { class: 'page-title' }, 'Kayıtlı İşler'),
    wrap,
    el('p', { class: 'note' }, 'Kayıtlar bu tarayıcıda saklanır; başka cihazdan görünmez.'));
}

// ---------- ekranlar ----------
function renderHome() {
  titleEl.textContent = 'Dişli Hesap';
  const list = el('div', { class: 'module-list' });
  for (const item of HOME_ITEMS) {
    const a = el('a', { href: '#' + item.route },
      el('span', {}, item.title, el('small', {}, item.desc)),
      el('span', { class: 'chev' }, '›'));
    list.append(a);
  }
  app.replaceChildren(
    el('p', { class: 'label-caps' }, 'Modüller'),
    el('h2', { class: 'page-title' }, 'Hassas Dişli Hesaplama'),
    list);
}

let activeVariant = 'yenimakine';
let gearMin = 20, gearMax = 100;

// Hassas çark arama — hedef orana 1/1.000.000 hassasiyetle kombinasyon arar
function precisionSearch(variant, E) {
  const target = E.value(variant.isOrani);
  const list = el('div');
  const draw = () => {
    list.replaceChildren();
    if (typeof target !== 'number' || !(target > 0)) {
      list.append(el('p', { class: 'note' }, 'Geçerli bir iş oranı hesaplanamadığı için arama yapılamıyor.'));
      return;
    }
    const found = findGears(target, gearMin, gearMax, 5);
    if (!found.length) {
      list.append(el('p', { class: 'note' }, 'Bu limitlerde kombinasyon bulunamadı.'));
      return;
    }
    for (const r of found) {
      const good = r.err <= target / 1e6 || r.err <= 1e-6;
      list.append(el('div', { class: 'result-row' },
        el('span', { class: 'val' + (good ? ' big' : '') },
          `A ${r.a} · B ${r.b} · C ${r.c} · D ${r.d}`),
        el('span', { class: 'val' + (good ? '' : ' err') }, 'hata ' + fmtSci(r.err))));
    }
    list.append(el('p', { class: 'note' },
      `Hedef oran: ${fmt(target, 10)} — ${gearMin}–${gearMax} diş aralığında arandı.`));
  };
  const grid = el('div', { class: 'form-grid' });
  const mkLimit = (label, get, set) => {
    const input = el('input', {
      type: 'text', inputmode: 'numeric', value: String(get()),
      oninput: (e) => {
        const n = parseInput(e.target.value);
        if (n !== null && n >= 1) { set(Math.trunc(n)); draw(); }
      },
    });
    return el('div', { class: 'field' }, el('label', {}, label, ' ', el('span', { class: 'unit' }, 'diş')), input);
  };
  grid.append(
    mkLimit('Alt limit', () => gearMin, (v) => { gearMin = v; }),
    mkLimit('Üst limit', () => gearMax, (v) => { gearMax = v; }));
  draw();
  return foldSection('Hassas çark arama (1/1.000.000)',
    el('div', { style: 'padding:16px' }, grid, list));
}

function renderCark() {
  const variant = CARK_VARIANTS.find(v => v.id === activeVariant) || CARK_VARIANTS[0];
  const E = STORES[variant.store];
  titleEl.textContent = 'Çark Hesabı';

  const tabs = el('div', { class: 'tabs' });
  for (const v of CARK_VARIANTS) {
    tabs.append(el('button', {
      class: v.id === variant.id ? 'active' : '',
      onclick: () => { activeVariant = v.id; renderCark(); },
    }, v.title));
  }

  const results = el('div');
  const draw = () => {
    const gearNames = ['A', 'B', 'C', 'D'];
    const gearsBox = el('div', { class: 'gears-box' },
      el('span', { class: 'label-caps' }, 'Önerilen çarklar'));
    variant.gears.forEach((cell, i) => {
      if (i) gearsBox.append(el('span', { class: 'sep' }, '·'));
      gearsBox.append(el('span', { class: 'g' }, gearNames[i], el('b', {}, fmt(E.value(cell), 0))));
    });

    const res = el('div', { class: 'results' },
      el('h3', { class: 'label-caps' }, 'Sonuçlar'),
      resultRow('İş Oranı', E.value(variant.isOrani), { dec: 8 }),
      resultRow('Ters Oran', E.value(variant.tersOran), { dec: 8 }),
      resultRow('Çark Oranı', E.value(variant.carkOrani), { dec: 8 }),
      resultRow('Hata', E.value(variant.hata), { sci: true, err: true }),
      resultRow('Derece Hatası (ondalık)', E.value(variant.derece), { dec: 6 }),
      resultRow('Derece Hatası', E.value(variant.dms), { big: true }));

    // Eksenler arası mesafe
    const x = variant.eksen;
    const eksenBox = foldSection('Eksenler arası mesafe',
      el('div', { style: 'padding:8px 16px 16px' },
        resultRow('do1 (dişli 1 bölüm dairesi)', E.value(x.do1), { dec: 4 }),
        resultRow('do2 (dişli 2 bölüm dairesi)', E.value(x.do2), { dec: 4 }),
        resultRow('av — eksenler arası (girilen da ile)', E.value(x.av), { big: true, dec: 4 }),
        resultRow('Ao — eksenler arası (hesaplanan da ile)', E.value(x.ao), { dec: 4 }),
        el('p', { class: 'note' },
          'Karşı dişliyi yukarıdaki Z2 ve da2 alanlarına gir; iki dişli birlikte burada görünür.')));

    // W ölçüsü — n elle değiştirilebilir
    const w = variant.wOlcusu;
    const nField = (nCell, wCell, nLabel, wLabel) => {
      const nVal = E.value(nCell);
      const input = el('input', {
        type: 'text', inputmode: 'numeric',
        value: typeof nVal === 'number' ? String(nVal) : '',
        oninput: (e) => {
          const n = parseInput(e.target.value);
          if (n !== null) { E.set(nCell, Math.trunc(n)); draw(); }
        },
      });
      const otoBtn = el('button', {
        class: 'btn ghost', title: 'Formüldeki otomatik değere dön',
        onclick: () => { E.reset(nCell); draw(); },
      }, 'Oto');
      return el('div', {},
        el('div', { class: 'save-row', style: 'margin-bottom:8px' },
          el('div', { class: 'field' },
            el('label', {}, nLabel + (E.isOverridden(nCell) ? ' (elle)' : ' (oto)')), input),
          otoBtn),
        resultRow(wLabel, E.value(wCell), { big: true, dec: 4 }));
    };
    const wBox = foldSection('W ölçüsü (n seçilebilir)',
      el('div', { style: 'padding:16px' },
        nField(w.n1, w.w1, 'n1', 'W1'),
        nField(w.n2, w.w2, 'n2', 'W2'),
        el('p', { class: 'note' }, 'n değerini değiştirince W ona göre hesaplanır; "Oto" formüldeki değere döndürür.')));

    // Kendi çarklarını dene
    const manualGrid = el('div', { class: 'form-grid' });
    variant.manualGears.forEach((cell, i) => {
      manualGrid.append(inputField(E, { cell, label: gearNames[i], unit: '' }, draw));
    });
    const manual = foldSection('Kendi çarklarını dene',
      el('div', { style: 'padding:16px' }, manualGrid,
        resultRow('Çark Oranı', E.value(variant.manualOran), { dec: 8 }),
        resultRow('Hata', E.value(variant.manualHata), { sci: true, err: true }),
        resultRow('Derece Hatası (ondalık)', E.value(variant.manualDerece), { dec: 6 }),
        resultRow('Derece Hatası', E.value(variant.manualDms), { big: true })));

    // Geometri ayrıntıları
    const cols = el('div', { class: 'cols' });
    for (const [name, cell] of variant.geometry) {
      cols.append(resultRow(name, E.value(cell), { dec: 4 }));
    }
    const geo = foldSection('Geometri ayrıntıları', cols);

    const saveCells = [...variant.inputs.map(d => d.cell), ...variant.manualGears];
    for (const c of [w.n1, w.n2]) if (E.isOverridden(c)) saveCells.push(c);

    results.replaceChildren(gearsBox, res, eksenBox, wBox,
      precisionSearch(variant, E), manual, geo,
      saveSection(variant, E, saveCells));
  };

  const grid = el('div', { class: 'form-grid' });
  for (const def of variant.inputs) grid.append(inputField(E, def, draw));

  const head = [tabs];
  if (variant.subtitle) head.push(el('p', { class: 'note', style: 'margin:-16px 0 16px' }, variant.subtitle));
  app.replaceChildren(...head,
    el('p', { class: 'label-caps' }, 'Parametre girişi'), grid, results);
  draw();
}

function renderSimple(key) {
  const mod = MODULES[key];
  titleEl.textContent = mod.title;
  const results = el('div', { class: 'results' });
  const draw = () => {
    results.replaceChildren(el('h3', { class: 'label-caps' }, 'Sonuçlar'));
    for (const out of mod.outputs) {
      const v = eng.value(out.cell);
      const err = out.errIfNonZero && typeof v === 'number' && Math.abs(v) > 1e-12;
      results.append(resultRow(out.label, v, { big: out.big, dec: out.dec ?? 6, err, sci: out.sci }));
    }
  };
  const grid = el('div', { class: 'form-grid' });
  for (const def of mod.inputs) grid.append(inputField(eng, def, draw));
  app.replaceChildren(el('p', { class: 'label-caps' }, 'Parametre girişi'), grid, results);
  draw();
}

let zstTab = 'tablo1';
let zstQuery = '';

function renderZst() {
  titleEl.textContent = 'ZST630 Çark Tablosu';

  const tabs = el('div', { class: 'tabs' },
    el('button', { class: zstTab === 'tablo1' ? 'active' : '', onclick: () => { zstTab = 'tablo1'; renderZst(); } }, 'Tablo 1'),
    el('button', { class: zstTab === 'tablo2' ? 'active' : '', onclick: () => { zstTab = 'tablo2'; renderZst(); } }, 'Tablo 2'));

  const table = el('table', { class: 'data' });
  const draw = () => {
    table.replaceChildren(
      el('thead', {}, el('tr', {},
        el('th', {}, 'Z'), el('th', {}, 'A'), el('th', {}, 'B'), el('th', {}, 'C'))));
    const tbody = el('tbody');
    const q = parseInput(zstQuery);
    for (const [z, a, b, c] of ZST[zstTab]) {
      tbody.append(el('tr', { class: q !== null && z === q ? 'hit' : '' },
        el('td', {}, String(z)), el('td', {}, String(a)), el('td', {}, String(b)), el('td', {}, String(c))));
    }
    table.append(tbody);
    const hit = table.querySelector('tr.hit');
    if (hit) hit.scrollIntoView({ block: 'center' });
  };

  const search = el('input', {
    type: 'text', inputmode: 'numeric', placeholder: 'Z değeri (örn: 24)', value: zstQuery,
    oninput: (e) => { zstQuery = e.target.value; draw(); },
  });

  app.replaceChildren(tabs,
    el('div', { class: 'search-row' },
      el('div', { class: 'field' }, el('label', {}, 'Z ara'), search)),
    table,
    el('p', { class: 'note' }, 'Kaynak: ZST630 tabloları (Z 05–79 ve 106–109).'));
  draw();
}

// ---------- yönlendirme ----------
function route() {
  const hash = (location.hash || '#home').slice(1);
  document.body.dataset.route = hash;
  if (hash === 'home' || hash === '') renderHome();
  else if (hash === 'cark') renderCark();
  else if (hash === 'zst') renderZst();
  else if (hash === 'kayitlar') renderJobs();
  else if (MODULES[hash]) renderSimple(hash);
  else renderHome();
  window.scrollTo(0, 0);
}

document.getElementById('back').addEventListener('click', () => { location.hash = '#home'; });
window.addEventListener('hashchange', route);
route();

// ---------- PWA: çevrimdışı çalışma / telefona kurulum ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* yerel dosyadan açılınca sessizce geç */ });
}
