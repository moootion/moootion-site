# MOOOTION — Devir Notları (Claude için)

Bu dosya, moootion.com portfolyo sitesinin Claude ile yürütülen geliştirme sürecinin devridir.
Kullanıcıyla **Türkçe** konuş. Kullanıcı: M. Ali Öztürk, İstanbul merkezli 3D artist & motion designer (15+ yıl, C4D + After Effects). Geliştirici değil; adımları net ve kısa anlat.

## Hedef
- Domain: **moootion.com** (GoDaddy'de kayıtlı). Instagram markası da `moootionstudio`.
- Referans site: **https://www.hirotos.com/** — yapı ve etkileşim kalitesi örnek alındı, tasarım KOPYALANMADI.
  - hirotos: Next.js + three.js + GSAP; kalıcı WebGL canvas, karışık-harf preloader + SVG dalga açılış, kavisli dalga sayfa geçişi, etiketli imleç, sonsuz yatay proje şeridi + kartın büyüyerek detaya dönüşmesi, sade About/Contact.
  - Onların imzası olan trafik direği sahnesi kopyalanmaz; kullanıcının kendi soyut objesi kullanılır.
- İçerik kaynağı: eski site maliozturk.com (Wix) + Behance (behance.net/maliozturk).
- Dil: sadece İngilizce site.

## Teknoloji
- Next.js 15 (App Router, TypeScript), React 19, three + @react-three/fiber + @react-three/drei, GSAP.
- Font: `@fontsource-variable/inter-tight` (npm, self-host; Google Fonts build sırasında çekilmez).
- **Statik export**: `next.config.mjs` → `output: "export"`, `trailingSlash: true`, `images.unoptimized`. Çıktı `out/`.
- TypeScript 5'e sabit (TS 7 Next 15 ile sorunlu).

## Dosya yapısı
| Yol | İçerik |
|---|---|
| `lib/site.ts` | İsim, unvan, base/focus/index, About metni, müşteriler, araçlar, e-posta, sosyal linkler |
| `lib/projects.ts` | 24 proje (Behance'ten). Alanlar: id, title, client, category, role, year?, summary, cover, video?, link |
| `components/AppShell.tsx` | Context (`ready`, `navigate`), dalga sayfa geçişi (`wavePath`), `useReveal` hook'u ([data-reveal] animasyonu) |
| `components/Preloader.tsx` | Harf karıştırma → "MOOOTION", SVG dalga ile açılış; bitince `app:intro` event'i |
| `components/Scene.tsx` | Kalıcı R3F canvas. Ana sahne "ooo": 3 iç içe torus + nefes alan çekirdek. Sürükle=döndür (atalet), tıkla=malzeme modu (Chrome/Iridescent/Pop), hover=halka büyür. Home dışında küçülüp gizlenir. `scene:mode` event'i yayınlar |
| `components/Cursor.tsx` | `[data-cursor="Etiket"]` → hap imleç; `setCursorLabel()` |
| `components/Nav.tsx`, `TLink.tsx` | Sağ üst menü, geri butonu; geçiş animasyonlu link |
| `app/page.tsx` | Home: isim/unvan, alt meta, malzeme ipucu |
| `app/projects/page.tsx` | Sonsuz yatay marquee (tekerlek/sürükleme), hover başlık, FLIP ile detay overlay (portal ile body'ye), küçük resim şeridi, ←/→/Esc |
| `app/about/page.tsx`, `app/contact/page.tsx` | Ortalanmış sade sayfalar |
| `app/globals.css` | Tüm stil; renkler: bg `#f4f3f0`, fg `#10100f`, accent `#ff5b1f` |
| `wrangler.jsonc` | Cloudflare Workers static assets (`./out`, 404-page, auto-trailing-slash) |

## Mevcut durum (2026-11-12)
- Repo: **github.com/moootion/moootion-site** (`main`). Kod push'landı, `npm run build` temiz.
- Tüm sayfalar headless Chrome ile test edildi (preloader, geçiş, mod değiştirme, detay overlay, mobil).
- **Hosting: Cloudflare** — kullanıcı Pages yerine bir **Worker** (`moootion-site`) oluşturdu, Git'e bağlı.
  - Gerekli ayar: Build command `npm run build`, Deploy command `npx wrangler deploy`.
  - `wrangler deploy --dry-run` lokal olarak başarılı (59 dosya). Canlı derlemenin sonucu henüz doğrulanmadı.
- Domain henüz bağlanmadı.

## Sıradaki işler
1. Cloudflare derlemesinin başarılı olduğunu doğrula, `*.workers.dev` adresini kontrol et.
2. Domain: kullanıcıya iki yol sun (önerilen: DNS'i Cloudflare'e taşı — GoDaddy'de nameserver'ları Cloudflare'inkilerle değiştir; sonra Worker → Settings → Domains & Routes → Custom domain `moootion.com` + `www`). Alternatif: GoDaddy'de kalıp sadece kayıt eklemek.
3. İçerik: `lib/projects.ts` içindeki summary/year alanları tahmini/genel; kullanıcıdan gerçek bilgileri al. Kapaklar şimdilik Behance CDN'den hotlink — kullanıcının kendi dosyalarına (`public/projects/`) geçir.
4. Videolar: her proje için kısa sessiz loop (mp4, ~1080p, <8 MB). Önerilen depolama: Cloudflare R2 (çıkış ücreti yok). `video` alanına URL verilince detayda otomatik oynar.
5. Ana sahne: kullanıcı kendi soyut objesini C4D'de modelleyip `public/models/hero.glb` (Draco, <5 MB) verecek; `Scene.tsx` içinde `<Rings />` yerine `useGLTF` ile yüklenecek, mevcut etkileşimler (sürükle/tıkla/hover) korunacak.
6. Cila: OG görseli, favicon, `prefers-reduced-motion` kontrolü, mobil ince ayar, Lighthouse.

## Notlar
- Commit kimliği: `M. Ali Öztürk <maliozturk@gmail.com>`.
- Sandbox'ta Behance CDN erişilemez; ekran testlerinde görselleri placeholder ile route'lamak gerekti — canlıda sorun değil.
- Çekirdek deformasyonu CPU'da (Icosahedron detail 18); daha ağır sahnede shader'a taşı.
