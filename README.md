# 🏰 THE LOST KINGDOM — Fantasy World 3D

Sebuah proyek eksplorasi dunia 3D fantasi interaktif yang dibangun menggunakan **Three.js** dan **Vite (Vanilla JavaScript)**. Menampilkan kemegahan istana kuno bertingkat tinggi, menara pengawas, dinding batu benteng, monolit kristal ajaib yang melayang dan berputar, serta atmosfer senja yang magis dengan sistem partikel bercahaya.

---

## ✨ Fitur Utama

- **Kastil Fantasi Megah (The Grand Citadel)**:
  - Dibangun secara prosedural menggunakan geometri Three.js (*no external 3D models required*).
  - Menara Utama (*Grand Keep*) bertingkat 3 dengan corbel batu, atap kerucut ungu slate, finial emas, dan jendela bercahaya hangat.
  - 4 Menara Bastion di setiap sudut benteng dengan parapet pelindung dan celah panah.
  - Dinding benteng batu pembatas dengan pola *crenellations* (merlons).
  - Gerbang utama dengan pintu kayu kisi besi (*portcullis*), jembatan viaduk, dan lentera obor berkedip.
  - Jembatan layang (*skybridge*) dan bendera kerajaan dengan simulasi kibasan angin.

- **Monolit Kristal Ajaib & Cincin Arcane**:
  - Kristal raksasa bercahaya neon (*octahedron*) yang melayang dan berputar di atas pelataran istana.
  - 6 kristal satelit kecil yang mengorbit dengan radius dan kecepatan berbeda.
  - 2 cincin runik sihir konsentris berputar berlawanan arah.
  - 4 kuil kristal tambahan (*shrines*) dengan tatanan pilar batu megalitikum.

- **Atmosfer & Pencahayaan Senja (Twilight)**:
  - Kubah langit gradien senja dramatis dengan taburan bintang malam.
  - Bulan sabit raksasa dengan lingkaran aura cahaya.
  - Kabut magis eksponensial (*fog*) menciptakan kedalaman visual yang memukau.
  - Cahaya matahari senja dengan bayangan lembut (*soft shadows*) dan titik cahaya dinamis berdenyut.

- **Partikel Sihir Melayang (1.400 Partikel)**:
  - Vorteks partikel energi sihir yang melayang dan berputar mengitari kastil.
  - Dapat diaktifkan atau dinonaktifkan secara *real-time* melalui tombol antarmuka.

- **Kontrol Interaktif & Navigasi**:
  - `OrbitControls` dengan redaman halus (*damping*), batas zoom, dan batas polar agar kamera tidak menembus tanah.
  - **Tombol Reset Kamera**: Transisi kamera sinematik (*smooth cubic easing*) kembali ke sudut pandang ikhtisar.
  - **Tombol Efek Sihir**: Sakelar untuk mengaktifkan/menonaktifkan pusaran partikel energi sihir.
  - **Mode Sinematik**: Tur kamera otomatis mengelilingi kerajaan.
  - **Bilah Jelajah Cepat (POI)**: Meluncur otomatis ke *Ikhtisar*, *Istana Utama*, *Kristal Ajaib*, *Gerbang Megah*, atau *Hutan Kuno*.
  - **Audio Ambien**: Sintesis suara pad chord mistis dan denting lonceng sihir via Web Audio API.

- **Responsif**:
  - Tampilan otomatis menyesuaikan layar Desktop, Laptop, Tablet, hingga Smartphone.

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan)

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Pengembangan Lokal
```bash
npm run dev
```
Buka browser pada alamat yang ditampilkan di terminal (biasanya `http://localhost:5173/`).

### 4. Membangun Bundle Produksi
```bash
npm run build
```
Hasil build akan tersimpan di dalam folder `dist/`.

### 5. Menjalankan Preview Hasil Build
```bash
npm run preview
```

---

## 🎮 Kontrol Kamera

| Tindakan | Mouse / Keyboard | Layar Sentuh (HP/Tablet) |
|---|---|---|
| **Putar Sudut Pandang (Rotate)** | Klik kiri & seret | 1 jari seret |
| **Perbesar / Perkecil (Zoom)** | Scroll roda mouse | Cubit 2 jari (Pinch) |
| **Geser Kamera (Pan)** | Klik kanan & seret | 2 jari seret |
| **Interaksi Kristal** | Klik kiri pada kristal | Ketuk kristal |

---

## 📄 Lisensi
Proyek ini dibuat untuk eksplorasi kreatif dan pembelajaran 3D web menggunakan Three.js.
