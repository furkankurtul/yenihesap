// Hassas çark arama — hedef orana en yakın A/B*C/D kombinasyonunu bulur.
// Dişliler [min, max] aralığında 1'er artan tam sayılardır.
// Yöntem: ortada buluşma (meet-in-the-middle) — tüm A/B oranları sıralanır,
// her C/D için hedef*(D/C) ikili aramayla bulunur. ~20.000² kombinasyon
// taraması yerine ~20.000·log işlem yapar, anında sonuç verir.

export function findGears(target, min, max, topN = 5) {
  min = Math.max(1, Math.trunc(min));
  max = Math.trunc(max);
  if (!(target > 0) || !Number.isFinite(target) || max < min) return [];

  // Sol taraf: tüm A/B çiftleri (değere göre sıralı)
  const left = [];
  for (let a = min; a <= max; a++) {
    for (let b = min; b <= max; b++) {
      left.push({ v: a / b, a, b });
    }
  }
  left.sort((x, y) => x.v - y.v);
  const values = left.map(p => p.v);

  const best = []; // {err, a, b, c, d, ratio}
  const seen = new Set();

  const consider = (li, c, d) => {
    if (li < 0 || li >= left.length) return;
    const p = left[li];
    const ratio = (p.a / p.b) * (c / d);
    const err = Math.abs(ratio - target);
    // eşdeğer permütasyonları tekilleştir (A/B ile C/D yer değiştirebilir)
    const k1 = p.a + ',' + p.b, k2 = c + ',' + d;
    const key = k1 <= k2 ? k1 + '|' + k2 : k2 + '|' + k1;
    if (seen.has(key)) return;
    if (best.length === topN && err >= best[best.length - 1].err) return;
    seen.add(key);
    best.push({ err, a: p.a, b: p.b, c, d, ratio });
    best.sort((x, y) => x.err - y.err);
    if (best.length > topN) seen.delete(keyOf(best.pop()));
  };
  const keyOf = (r) => {
    const k1 = r.a + ',' + r.b, k2 = r.c + ',' + r.d;
    return k1 <= k2 ? k1 + '|' + k2 : k2 + '|' + k1;
  };

  for (let c = min; c <= max; c++) {
    for (let d = min; d <= max; d++) {
      const want = target * d / c; // aranan A/B değeri
      // ikili arama: want'a en yakın komşular
      let lo = 0, hi = values.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (values[mid] < want) lo = mid + 1; else hi = mid;
      }
      consider(lo, c, d);
      consider(lo - 1, c, d);
      consider(lo + 1, c, d);
    }
  }
  return best;
}
