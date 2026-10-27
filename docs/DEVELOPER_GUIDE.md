# FrontEnd Developer Guide — Platform v2.0.0

**Last Updated**: October 27, 2026

---

## 1. Quick Development Setup

The FrontEnd dashboard (`FrontEnd/`) is built with **React 19**, **TypeScript**, **Vite**, **Material UI (MUI)**, **TanStack Query v5**, **SignalR Client (`@microsoft/signalr`)**, and **ApexCharts**.

### Prerequisites:
- Node.js (v18+ / v20+)
- npm (v9+)

### Installation:
```powershell
cd "e:\CCTV Analytics\FrontEnd"
npm install
```

---

## 2. Development & Build Commands

### Run Development Server:
```powershell
npm run dev
```
*(Open `http://localhost:5173` in your browser)*

### Type-Checking & Production Build:
```powershell
npm run build
```

### Preview Production Build:
```powershell
npm run preview
```

### Linting:
```powershell
npm run lint
```

---

## 3. Docker Containerization

### Build Docker Image:
```powershell
docker build -t cctv-analytics-frontend .
```

### Run via Workspace Docker Compose:
```powershell
cd "e:\CCTV Analytics"
docker compose up -d
```

---

## 4. FrontEnd Project Structure

- `src/layouts/`: Main application shell (`FullLayout.tsx`), responsive sidebar navigation, and top header bar.
- `src/views/`: Feature pages (`Dashboard`, `Cameras`, `Rooms` / Spatial Hierarchy, `Incidents`, `Settings`, `Login`, `Register`).
- `src/components/`: Reusable UI widgets, interactive Polygon Zone Editor Canvas, telemetry badges, and charts.
- `src/services/` & `src/api/`: Axios REST clients, TanStack Query hooks, and SignalR `/hubs/telemetry` real-time client.
- `src/router.tsx`: React Router configuration with `AuthGuard` and `GuestGuard`.
- `src/theme.ts`: Material UI theme tokens and color palette definitions.
