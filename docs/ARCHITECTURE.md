# FrontEnd Architecture Specification — Platform v1.0.0

---

## 1. Frontend System Architecture

```text
                               ┌────────────────────────────────────────┐
└─────────────────────────────────────────┬────────────────────────────────────────────────┘
                                          │
                                          ▼
                               ┌────────────────────────────────────────┐
                               │     Communication Layer (Publishers)   │
                               └────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

1. **Immutable Domain Snapshot (`Scene`)**: Pemisahan total antara state internal pengelakan objek dan modul analitik. Modul analitik bersifat *read-only*.
2. **Plugin Architecture & Discovery**: Modul analitik ditemukan secara otomatis dari `manifest.json` di bawah `plugins/` dan dimuat secara dinamis via `PluginLoader`.
3. **Capability Negotiation**: Kernel memverifikasi kemampuan platform (`CapabilitySet`) sebelum mengeksekusi modul; modul yang tidak didukung bertransisi ke `UNSUPPORTED` secara bersih.
4. **Execution Scheduler**: Pengaturan ritme waktu eksekusi (`EVERY_FRAME`, `INTERVAL`, `MANUAL`) terpisah dari logika pemrosesan modul.
5. **Exception Isolation Barrier**: Kegagalan modul analitik diisolasi penuh tanpa merusak kernel utama.
6. **Passive Diagnostics & Profiling**: Kolektor metrik pasif tanpa efek samping pada alur eksekusi kernel.