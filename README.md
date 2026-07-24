# CCTV Analytics Front-End Template

A premium, modern React + Vite + TypeScript web application template designed for **CCTV Analytics**. It uses Material UI (MUI 9) with responsive design, glassmorphism components, and dynamic background animations.

## Key Features

- **Rebranded CCTV Interface**: Styled specifically for video monitoring, camera statistics, AI detection timelines, and incident response notifications.
- **Client-Side Auth / Mock Credentials**: Login and Registration are pre-configured to work completely client-side utilizing `localStorage`.
  - **Username**: `admin`
  - **Password**: `P@ssw0rd`
  - New user sign-ups are stored locally so you can log in with them immediately without requiring a running database server.
- **MUI 9 Custom Theme**: Tailored theme config utilizing the `Outfit` typeface, rounded components (`borderRadius: 16`), glassmorphism cards, and HSL radial background gradients.
- **SPA Routing & Security Guards**: Implemented using React Router 7. Includes `AuthGuard` (locks console views for authenticated sessions) and `GuestGuard` (for security redirects).
- **CCTV Analytics Rules Configurator**: Allows configuring AI classification targets (Person, Vehicle, Animal detection), confidence thresholds, retention periods, and alert webhooks.
- **Deployment-Ready Docker/Nginx**: Includes Nginx config, multi-stage deployment configurations, and automated Git pull update hooks.

## Project Structure

```bash
├── public/                 # Favicons, logo images, static config
├── scripts/                # Socat/bash docker auto-update scripts
├── src/
│   ├── assets/             # SVGs and static mock graphics
│   ├── components/         # Reusable inputs (PhoneInput, StatsShowcase)
│   ├── context/            # Global context (Theme toggles)
│   ├── layouts/            # Sidebar navigation, visual blurs & outlet
│   ├── theme.ts            # Palette customization and border definitions
│   ├── router.tsx          # Auth-guarded navigation maps
│   ├── utils/              # Axios bindings and session managers
│   └── views/              # CCTV Dashboard, Settings, Login, and Register
├── Dockerfile              # Docker container setup
├── docker-compose.yml      # Local orchestration orchestrator
└── nginx.conf              # Production server router
```

## Running the Application

### Development Server
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```
