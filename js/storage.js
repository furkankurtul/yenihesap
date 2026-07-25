// İş kaydı — kayıtlar tarayıcının yerel deposunda tutulur, JSON dosyasıyla
// dışa/içe aktarılabilir (GitHub'daki kayitlar/ klasörüne yedeklemek için).
const KEY = 'disli-hesap-jobs';

export function listJobs() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(jobs) {
  localStorage.setItem(KEY, JSON.stringify(jobs));
}

export function saveJob(job) {
  const rec = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ts: Date.now(),
    ...job,
    name: (job.name || '').trim(),
    firma: (job.firma || '').trim(),
    note: (job.note || '').trim() || null,
  };
  persist([rec, ...listJobs()]);
  return rec;
}

export function deleteJob(id) {
  persist(listJobs().filter(j => j.id !== id));
}

export function exportJobs() {
  return JSON.stringify({ tip: 'disli-hesap-kayitlar', surum: 1, tarih: new Date().toISOString(), isler: listJobs() }, null, 2);
}

// Dosyadan içe aktarım — aynı id'ler atlanır, yeni kayıtlar eklenir
export function importJobs(text, { replace = false } = {}) {
  const data = JSON.parse(text);
  const gelen = Array.isArray(data) ? data : data.isler;
  if (!Array.isArray(gelen)) throw new Error('Dosya biçimi tanınmadı');
  if (replace) { persist(gelen); return { eklenen: gelen.length, atlanan: 0 }; }
  const mevcut = listJobs();
  const idler = new Set(mevcut.map(j => j.id));
  const yeni = gelen.filter(j => !idler.has(j.id));
  persist([...yeni, ...mevcut].sort((a, b) => b.ts - a.ts));
  return { eklenen: yeni.length, atlanan: gelen.length - yeni.length };
}
