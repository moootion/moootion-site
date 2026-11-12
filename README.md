# MOOOTION — moootion.com

M. Ali Öztürk'ün portfolyo sitesi. Next.js 15 + React Three Fiber + GSAP.

## Çalıştırma
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # üretim derlemesi
```

## İçerik nerede?
| Dosya | Ne var |
|---|---|
| `lib/site.ts` | İsim, unvan, About metni, müşteriler, iletişim, sosyal linkler |
| `lib/projects.ts` | Proje listesi (başlık, müşteri, kategori, yıl, açıklama, kapak, video, link) |
| `components/Scene.tsx` | Ana sayfadaki 3D sahne (üç halka + çekirdek) |
| `app/globals.css` | Renkler, tipografi, yerleşim |

## Proje eklemek
`lib/projects.ts` içine yeni bir obje ekle. Video için `video: "https://.../loop.mp4"` (sessiz, kısa loop, ~1080p, <8 MB) ver; detay görünümünde otomatik oynar.

## Kendi 3D modelini koymak
1. Cinema 4D → glTF (.glb) export (Draco sıkıştırma açık, ideal <5 MB).
2. Dosyayı `public/models/hero.glb` olarak koy.
3. `components/Scene.tsx` içinde `<Rings />` yerine `useGLTF("/models/hero.glb")` ile yüklenen sahneyi kullan.

## Yayın
Vercel'e bağlı: `main` dalına her push otomatik yayına çıkar.
