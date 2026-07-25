// İş kaydı — hesaplar tarayıcının yerel deposunda (localStorage) saklanır
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

export function saveJob({ name, route, moduleTitle, variant, inputs, note }) {
  const jobs = listJobs();
  const job = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    ts: Date.now(),
    route,
    moduleTitle,
    variant: variant || null,
    inputs, // { hücre: değer }
    note: note || null,
  };
  const next = [job, ...jobs];
  persist(next);
  return job;
}

export function deleteJob(id) {
  persist(listJobs().filter(j => j.id !== id));
}
