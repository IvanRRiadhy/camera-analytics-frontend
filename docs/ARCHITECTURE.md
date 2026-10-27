# FrontEnd Architecture Specification — Platform v2.0.0

**Last Updated**: October 27, 2026

---

## 1. Frontend System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                     React 19 Single-Page Application (`FrontEnd/`)                       │
│                                                                                          │
│  ┌──────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │   Presentation Views     │  │  Spatial & Zone Canvas  │  │  Observability & Admin  │  │
│  │  - Live Dashboard        │  │  - 6-Tier Spatial Tree  │  │  - Engine Nodes Status  │  │
│  │  - Multi-Camera Grid     │  │  - Interactive Polygon  │  │  - Telemetry DevTools   │  │
│  │  - Incidents & Evidence  │  │    Zone Editor Canvas   │  │  - System Settings      │  │
│  └────────────┬─────────────┘  └────────────┬────────────┘  └────────────┬────────────┘  │
│               │                             │                            │               │
│               └─────────────────────────────┼────────────────────────────┘               │
│                                             ▼                                            │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     State & Real-Time Synchronization Layer                        │  │
│  │  - ADR-011 High-Frequency WebSocket / SignalR Telemetry Store (`/hubs/telemetry`)  │  │
│  │  - TanStack Query v5 REST State Cache & Optimistic Mutations                       │  │
│  └──────────────────────────────────────────┬─────────────────────────────────────────┘  │
└─────────────────────────────────────────────┼────────────────────────────────────────────┘
                                              │ HTTPS REST API & SignalR WebSockets
                                              ▼
                               ┌────────────────────────────────────────┐
                               │     ASP.NET Core BackEnd Web API       │
                               └────────────────────────────────────────┘
```

---

## 2. Core Architectural Pillars

1. **ADR-011 Real-Time Telemetry State Isolation**:
   - Decouples high-frequency SignalR WebSocket packets (`/hubs/telemetry`) from React component trees using buffered subscribers, preventing UI re-render thrashing during multi-camera 1Hz–30Hz updates.
2. **6-Tier Spatial Hierarchy Management**:
   - Interactive navigation and CRUD management across `Site -> Building -> Floor -> Room -> Camera -> Zone`.
3. **Interactive Polygon Zone Editor Canvas**:
   - HTML5 Canvas overlay for drawing, editing, and validating normalized polygon counting/intrusion/loitering zones directly over camera snapshots.
4. **Server-State Caching with TanStack Query v5**:
   - Declarative query keys, automatic background refetching, and cache invalidation for camera catalogs, incidents, and analytics history.
5. **MUI v9 / Emotion Design System**:
   - Responsive dark/light enterprise theme (`FullLayout.tsx`), ApexCharts analytics visualizations, and role-guarded routing (`AuthGuard`, `GuestGuard`).

---

## 3. Reference Documents in `docs/`

- [`FRONTEND_TECHNICAL_REFERENCE.md`](./FRONTEND_TECHNICAL_REFERENCE.md) — Exhaustive FrontEnd feature & component technical reference.
- [`BLUEPRINT_FRONTEND_DASHBOARD.md`](./BLUEPRINT_FRONTEND_DASHBOARD.md) — FrontEnd UI/UX, state architecture, and SignalR integration blueprint.
