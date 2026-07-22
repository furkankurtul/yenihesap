# Dişli Hesap

Dişli imalatı (azdırma) atölye hesaplarını tek sayfalık bir web uygulamasına taşıyan araç.
Kaynak: atölyede kullanılan Excel çalışma kitabı — tüm formüller birebir taşındı ve
Excel'in kayıtlı sonuçlarıyla otomatik doğrulandı.

## Modüller

- **Çark Hesabı** — Azdırma (Staehely) · Küçük Makine · Büyük Makine; önerilen A·B·C·D
  çarkları, iş/ters oran, hata ve derece hatası (º ' ″)
- **Hassas çark arama** — alt/üst diş limiti içinde 1/1.000.000 hedefli kombinasyon arama
- **Modül Hesabı** — w1/w2 ölçümünden mn ve DP
- **Derece Hatası** — kalite kontrol sonrası
- **Malzeme Ağırlık / Maliyet**
- **ZST630 Çark Tablosu**, **Taksimat**, **Konik**, **Bıçak Derece**
- **Kayıtlı İşler** — hesapları iş adıyla kaydet ve geri çağır (tarayıcıda saklanır)

## Yerelde çalıştırma

```bash
python3 -m http.server 8766
# http://localhost:8766
```

## Mimari

- `js/engine.js` — Excel formül yorumlayıcısı (PI, trigonometri, TRUNC, INT, IF,
  VLOOKUP, MINVERSE, CONCATENATE, GCD)
- `data/cells.js` — çalışma kitabındaki hücreler (formüller + değerler)
- `data/gears.js` — 25.405 satırlık çark oranı arama tablosu
- `data/zst.js` — ZST630 tabloları
- `js/optimizer.js` — ortada buluşma yöntemiyle hassas çark arama
- `js/app.js` / `js/modules.js` — arayüz ve hücre eşlemeleri
