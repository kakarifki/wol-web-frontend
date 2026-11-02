# WOL Web Frontend

Aplikasi Web antarmuka (Client UI) untuk Remote Wake-on-LAN (WoL). Dibangun dengan **React**, **Vite**, **TypeScript**, dan **Tailwind CSS**.

## Fitur
- Desain mobile-first, dark mode futuristic aesthetic.
- Tombol "Nyalakan PC" interaktif dengan animasi glowing ring, feedback tactile haptic pada HP, dan anti-spam rate limiting (5 detik).
- Indikator status live router Ruijie (Online / Offline) dari polling heartbeat tiap 3-4 detik.
- Input password keamanan dengan opsi "Ingat di perangkat ini" (`localStorage`).
- Ringkasan riwayat trigger bangun (Pending / Dispatched to Router).
- Multi-stage Dockerfile (Nginx Alpine) siap pakai untuk Coolify.

## Environment Variables

| Variable | Default | Deskripsi |
|---|---|---|
| `VITE_API_BASE_URL` | `https://wol.kakarifki.web.id` | Alamat API Backend Coordinator |

## Menjalankan di Lokal (Development)

1. Pasang dependencies:
   ```bash
   npm install
   ```
2. Salin `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```

## Deploy di Coolify

1. Push folder ini ke repositori GitHub tersendiri (misal `wol-frontend`).
2. Di Coolify, buat resource **New Application** dari git repository tersebut.
3. Set domain `https://wakeonlan.kakarifki.web.id`.
4. Set Build-time Environment Variable: `VITE_API_BASE_URL=https://wol.kakarifki.web.id`.
5. Coolify akan otomatis build dan deploy via `Dockerfile` (Nginx Alpine) pada port 80.

