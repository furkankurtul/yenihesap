# İş Kayıtları

Bu klasör, uygulamadan alınan iş kaydı yedeklerini saklar.

## Yedek alma

1. Uygulamada **Kayıtlı İşler** ekranını aç.
2. **Yedeği indir** düğmesine bas — `isler-YYYY-AA-GG.json` dosyası iner.
3. Dosyayı bu klasöre koyup depoya gönder:

```bash
git add kayitlar/ && git commit -m "chore: iş kayıtları yedeği" && git push
```

## Yedeği geri yükleme

Başka bir cihazda (veya kayıtlar silindiyse) **Kayıtlı İşler → Yedekten yükle**
ile buradaki JSON dosyasını seç. Aynı kayıtlar tekrar eklenmez; yalnızca eksikler
tamamlanır.

## Not

Kayıtlar tarayıcının yerel deposunda tutulur, yani cihaza özeldir. Ofiste ortak
kullanım için ilerideki adım: yerel ağda küçük bir sunucu (veya paylaşılan dosya)
üzerinden kayıtları merkezî tutmak.
