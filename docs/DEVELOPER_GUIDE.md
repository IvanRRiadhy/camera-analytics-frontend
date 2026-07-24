# FrontEnd Developer Guide v1.0.0

---

## 1. Quick Development Setup

FrontEnd ini dikembangkan menggunakan **React 19**, **TypeScript 6**, **Vite 8**, dan **Material UI (MUI v9)**.

### Prerequisites:
- Node.js (v18+)
- npm (v9+)

### Installation:
```bash
cd FrontEnd
npm install
```

---

## 2. Development & Build Commands

### Menjalankan Dev Server:
```bash
npm run dev
```
*(Buka `http://localhost:5173` di browser)*

### Type-checking & Production Build:
```bash
npm run build
```

### Preview Production Build:
```bash
npm run preview
```

### Linting:
```bash
npm run lint
```

---

## 3. Docker Containerization Setup

### Build Docker Image:
```bash
docker build -t cctv-analytics-frontend .
```

### Run Container via Docker Compose:
```bash
docker-compose up -d
```

---

## 4. FrontEnd Project Structure

- `src/layouts/`: Component layout utama (`FullLayout.tsx`) beserta header & drawer.
- `src/views/`: Main view pages (`Dashboard`, `Cameras`, `Rooms`, `Settings`, `Login`, `Register`).
- `src/router.tsx`: Konfigurasi `react-router` v7 beserta `AuthGuard` dan `GuestGuard`.
- `src/context/`: Context provider aplikasi (e.g. `ThemeContext`).
- `src/theme.ts`: Konfigurasi token & palet warna Material UI.
- `src/config.ts`: Environment & global API service configuration.

