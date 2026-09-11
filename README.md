# VLT Dashboard — Vercel Deploy

## Cara Deploy

### 1. Patch Dashboard HTML

Buka `vlt-dashboard-v5.html`, cari semua URL yang mengarah ke VPS:

```
http://31.97.189.238:8099
```

Ganti jadi string kosong (hapus), supaya jadi relative path:

```
SEBELUM:  fetch("http://31.97.189.238:8099/api/health")
SESUDAH:  fetch("/api/health")
```

Atau jalankan command ini:
```bash
sed -i 's|http://31.97.189.238:8099||g' vlt-dashboard-v5.html
```

Lalu rename dan pindahkan:
```bash
cp vlt-dashboard-v5.html public/index.html
```

### 2. Set Environment Variable di Vercel

Setelah import project, tambahkan di Vercel Settings > Environment Variables:

| Key              | Value                              |
|------------------|------------------------------------|
| `VLT_API_TOKEN`  | `DO9dHMyWXGpOaCbVGasLBr9C5BuLcPNB` |
| `VPS_BASE_URL`   | `http://31.97.189.238:8099`        |

### 3. Deploy

**Cara A — Via GitHub (recommended):**
1. Push folder ini ke repo GitHub baru
2. Buka vercel.com/new
3. Import dari GitHub
4. Set env variables di step setup
5. Deploy

**Cara B — Via Vercel CLI:**
```bash
npm i -g vercel
cd vlt-vercel
vercel --prod
# Ikuti wizard, set env variables lewat dashboard Vercel
```

## Struktur Project

```
vlt-vercel/
├── api/
│   └── [...path].js    ← Proxy: /api/* → VPS HTTP
├── public/
│   └── index.html      ← Dashboard (ganti dengan v5 yang sudah di-patch)
├── vercel.json
├── package.json
└── README.md
```

## Cara Kerja Proxy

```
Browser (HTTPS) → Vercel /api/health → Proxy → VPS http://31.97.189.238:8099/api/health
                  ^^^^^^^^^^^^^^^^             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                  Sama domain, HTTPS           HTTP tapi server-to-server (no browser block)
```

Mixed content hilang karena browser cuma lihat HTTPS → HTTPS (sama domain Vercel).
Token VLT disimpan di env variable Vercel, TIDAK ada di kode client.

## Troubleshooting

- **502 VPS tidak bisa dihubungi** → API di VPS mati, restart pakai command nohup
- **500 VLT_API_TOKEN belum di-set** → Tambahkan env variable di Vercel dashboard
- **Dashboard kosong** → Belum replace `public/index.html` dengan dashboard v5
