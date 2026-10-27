# ENTERPRISE CCTV ANALYTICS PLATFORM
## Frontend Web Dashboard & Realtime Architecture Blueprint

**Dokumen**: Frontend Web Dashboard Technical Architecture & Realtime State Blueprint  
**Versi**: 2.0.0 Enterprise Edition  
**Tanggal**: Oktober 2026  
**Klasifikasi**: Spesifikasi Teknis Frontend SPA, State Management & DevTools  
**Status**: Approved Living Architecture  
**Lokasi Berkas**: `docs/BLUEPRINT_FRONTEND_DASHBOARD.md`  

---

## 1. Executive Summary & Lingkup Domain Frontend

Frontend Web Client (`FrontEnd/`) adalah antarmuka operasi terpadu (*Enterprise Operations Center Dashboard*) yang dirancang untuk operator keamanan, analis data spasial, dan administrator sistem. Aplikasi ini dibangun sebagai Single Page Application (SPA) modern berbasis **React 18 / 19, TypeScript, dan Vite**, dengan fokus pada ketahanan visual, performa render berkecepatan tinggi, dan konsistensi status real-time.

### Keunggulan Arsitektur:
1. **Arsitektur Realtime State ADR-011**: Mengisolasi pemrosesan paket event berfrekuensi tinggi dari rendering antarmuka pengguna guna mencegah pemborosan siklus CPU pada browser (*zero render thrashing*).
2. **Editor Geometri Kanvas 2D Terpadu**: Memfasilitasi operator dalam menggambar poligon zona analitik interaktif langsung di atas frame video dengan konversi otomatis ke koordinat normalisasi $[0.0, 1.0]$.
3. **Suite Observabilitas DevTools (`/_devtools`)**: Toolkit internal terintegrasi untuk inspeksi paket WebSocket SignalR, visualisasi pohon pelacakan dispatcher (*timeline trace*), dan metrik performa memori klien secara transparan.

---

## 2. Arsitektur Realtime State ADR-011

Untuk menangani streaming data analitik berkecepatan tinggi dari simpul AI Engine tanpa menimbulkan degradasi performa pada UI, platform menerapkan spesifikasi arsitektur **ADR-011 Realtime State Architecture**:

```mermaid
flowchart TB
    SignalRStream["SignalR WebSocket Stream (/hubs/telemetry)"]
    
    subgraph ADR011Framework [ADR-011 Realtime State Framework]
        Dispatcher["RealtimeDispatcher (Event Router & Telemetry Sink)"]
        TraceRecorder["RuntimeTraceRecorder (Distributed Latency Tracing)"]
        
        subgraph DomainStores [Domain Stores Suite]
            RuntimeStore["RuntimeStore (Fleet Health & Aggregates)"]
            EventStore["AnalyticsEventStore (AI Detection Events)"]
            IncidentStore["IncidentStore (Escalated Security Incidents)"]
            EngineStore["EngineStore (Worker Nodes & GPU Metrics)"]
            CameraStore["CameraStore (RTSP Stream Connectivity)"]
            PipelineStore["PipelineStore (Active AI Bindings)"]
        end
        
        Dispatcher --> DomainStores
        Dispatcher --> TraceRecorder
    end
    
    subgraph UIComponents [Interactive UI Layer]
        DevTools["DevTools Observability Center (/_devtools)"]
        OperationsDashboard["Security Operations Center (Dashboard.tsx)"]
        SpatialNavigation["Spatial Tree & Rooms (Rooms.tsx)"]
        CameraFleet["Camera Management (Cameras.tsx)"]
        ZoneCanvas["Zone Polygon Canvas Editor"]
    end
    
    SignalRStream --> Dispatcher
    DomainStores --> OperationsDashboard
    DomainStores --> SpatialNavigation
    DomainStores --> CameraFleet
    DomainStores --> ZoneCanvas
    TraceRecorder --> DevTools
    DomainStores --> DevTools
```

### 6 Domain Store Terdaftar (ADR-011):
1. **`RuntimeStore`**: Mengagregasikan metrik kesehatan tingkat tinggi seluruh sistem (jumlah total engine, engine aktif, kamera online, dan throughput event per detik).
2. **`AnalyticsEventStore`**: Mengelola antrean ring buffer event deteksi AI (intrusi, tripwire, loitering). Dilengkapi batas kapasitas memori maksimum (500 event) guna mencegah kebocoran memori (*zero memory leak guarantee*).
3. **`IncidentStore`**: Mengelola siklus hidup insiden keamanan yang memerlukan eskalasi tindakan (*New*, *Acknowledged*, *Resolved*).
4. **`EngineStore`**: Memantau metrik perangkat keras pekerja AI secara real-time (beban CPU, suhu GPU, penggunaan VRAM, dan FPS aktual).
5. **`CameraStore`**: Menyimpan status konektivitas stream RTSP kamera (resolusi, status sinkronisasi, dan frame terakhir).
6. **`PipelineStore`**: Melacak asosiasi dinamis antara model AI dengan kamera tertentu serta status pipeline inferensi.

---

## 3. Modul & Alur Kerja Pengguna Interaktif (*Interactive Modules*)

### 3.1 Navigasi Hirarki Spasial & Denah Gedung (`Rooms.tsx`)
* Menampilkan pohon spasial multi-tingkat (*Site -> Building -> Floor -> Room*).
* Menyajikan denah lantai 2D interaktif (*Floorplan Viewer*) dengan penanda posisi kamera aktif dan indikator status visual (Hijau: Aman, Merah: Terjadi Pelanggaran).

### 3.2 Manajemen Kamera & Armada Video (`Cameras.tsx`)
* Grid kartu kamera dengan cuplikan gambar langsung (*live thumbnail*), nama stream RTSP, ruangan terafiliasi, dan tombol aksi cepat (*Edit*, *Assign Pipeline*, *Reboot Stream*).
* Modal formulir pendaftaran kamera baru dengan validasi format URL RTSP secara real-time (`rtsp://user:pass@host:port/path`).

### 3.3 Editor Kanvas Poligon Spasial 2D (*Polygon Zone Canvas Editor*)
* Kanvas HTML5 2D yang ditempatkan di atas frame snapshot kamera.
* Operator dapat melakukan klik untuk menambahkan titik sudut poligon (*vertices*), menggeser titik yang ada, dan menutup poligon.
* **Transformasi Koordinat Normalisasi**:
  Setiap titik piksel kanvas $(X_c, Y_c)$ secara otomatis dikonversi ke koordinat proporsional sebelum dikirim ke API backend:
  $$x_{\text{norm}} = \frac{X_c}{\text{CanvasWidth}}, \quad y_{\text{norm}} = \frac{Y_c}{\text{CanvasHeight}}, \quad \text{dimana } x, y \in [0.0, 1.0]$$

---

## 4. Platform Observabilitas DevTools Terpadu (`/_devtools`)

Platform menyertakan suite pemantauan diagnostik terintegrasi untuk tim rekayasa perangkat lunak dan DevOps yang dapat diakses langsung pada rute internal `/_devtools`:

```
/_devtools
   ├── /_devtools/dashboard   (KPI Ringkasan Kesehatan & Telemetri Armada)
   ├── /_devtools/stores      (Registry 6 Store: Entitas, Memory, Update Rate)
   ├── /_devtools/inspect     (Inspektor Entitas & Penampil Pohon JSON Interaktif)
   ├── /_devtools/signalr     (Live SignalR Packet Sniffer & Drawer Detail)
   ├── /_devtools/timeline    (Pohon Urutan Eksekusi Dispatcher & Trace Latensi)
   ├── /_devtools/logs        (Konsol Log Terpusat dengan Ekspor JSON/CSV)
   └── /_devtools/performance (Pusat Analisis Throughput & Meteran RingBuffer)
```

### Fitur Kunci DevTools:
1. **SignalR Packet Sniffer (`/_devtools/signalr`)**: Memvisualisasikan seluruh paket data WebSocket yang masuk dan keluar secara langsung, menampilkan event name, ukuran muatan (*payload size*), korelasi ID, dan drawer inspeksi JSON mentah.
2. **Dispatcher Execution Timeline (`/_devtools/timeline`)**: Visualisasi diagram sekuensial vertikal untuk menelusuri berapa mikrodetik yang dihabiskan oleh masing-masing store saat menangani event analitik tertentu.
3. **Pusat Log Klien & Ekspor (`/_devtools/logs`)**: Mencatat setiap error jaringan, rekoneksi WebSocket, dan anomali rendering dengan fitur filter tingkat keparahan (*INFO*, *WARN*, *ERROR*) serta tombol satu klik untuk ekspor log ke format file CSV atau JSON.

---

## 5. Keamanan Rute, Otentikasi & Interceptor HTTP

```mermaid
sequenceDiagram
    autonumber
    participant User as Pengguna / Operator
    participant View as Halaman Terproteksi (/dashboard)
    participant Guard as AuthGuard (router.tsx)
    participant Store as AuthStore / localStorage
    participant Axios as Axios HTTP Interceptor
    participant API as Backend REST API

    User->>View: Akses URL /dashboard
    View->>Guard: Evaluasi Status Otentikasi
    Guard->>Store: Baca token 'auth_token'
    alt Token Tidak Ada
        Store-->>Guard: Null / Kosong
        Guard-->>User: Redirect Otomatis ke /login
    else Token Valid
        Store-->>Guard: Token Ditemukan
        Guard-->>View: Render Komponen Dashboard
        View->>Axios: Panggil GET /api/v1/spatial/cameras
        Axios->>Axios: Sisipkan Header 'Authorization: Bearer <token>'
        Axios->>API: Kirim Permintaan HTTP dengan Kredensial
        API-->>View: Kembalikan Data Terproteksi
    end
```

### Komponen Pengamanan Klien:
* **`AuthGuard`**: Komponen pembungkus rute (*Route Wrapper*) yang memverifikasi eksistensi session token. Jika sesi belum aktif, pengguna dialihkan secara instan ke halaman `/login`.
* **`GuestGuard`**: Mencegah pengguna yang sudah memiliki sesi aktif untuk kembali membuka halaman `/login` atau `/register`, dan otomatis mengarahkannya ke `/dashboard`.
* **Axios Request Interceptor**: Secara transparan melekatkan header `Authorization: Bearer <token>` pada setiap permintaan jaringan HTTP yang dikirimkan ke server backend.
* **Axios Response Interceptor**: Mengintersepsi respons kesalahan HTTP `401 Unauthorized` untuk secara otomatis membersihkan sesi lokal dan mereset status aplikasi ke tampilan login.
