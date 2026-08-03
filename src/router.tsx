import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { FullLayout } from './layouts/FullLayout';
import { Dashboard } from './views/Dashboard';
import { Monitoring } from './views/Monitoring';
import { Settings } from './views/Settings';
import { Cameras } from './views/Cameras';
import { Rooms } from './views/Rooms';
import { FleetOverview } from './views/FleetOverview';
import { NodeDetailView } from './views/NodeDetailView';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { AuthGuard, GuestGuard } from './components/Guards';
import ModuleCatalog from './views/ModuleCatalog';
import PipelineAssignmentView from './views/PipelineAssignmentView';
import RuntimeObservabilityView from './views/RuntimeObservabilityView';

// Lazy-Loaded DevTools Platform Module (Zero Production Bundle Overhead)
const DevToolsLayout = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsLayout })));
const DevToolsDashboardPage = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsDashboardPage })));
const DevToolsStoresPage = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsStoresPage })));
const DevToolsSignalRPage = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsSignalRPage })));
const DevToolsDispatcherPage = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsDispatcherPage })));
const DevToolsBootstrapPage = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsBootstrapPage })));
const DevToolsPerformancePage = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsPerformancePage })));
const DevToolsLogsPage = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsLogsPage })));
const DevToolsConfigPage = lazy(() => import('./modules/devtools').then((m) => ({ default: m.DevToolsConfigPage })));

import { SiteListPage } from './modules/site';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <FullLayout />
      </AuthGuard>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/monitoring', element: <Monitoring /> },
      { path: '/engines', element: <FleetOverview /> },
      { path: '/engines/:instanceId', element: <NodeDetailView /> },
      { path: '/cameras', element: <Cameras /> },
      { path: '/rooms', element: <Rooms /> },
      { path: '/sites', element: <SiteListPage /> },
      { path: '/master/sites', element: <SiteListPage /> },
      { path: '/analytics/catalog', element: <ModuleCatalog /> },
      { path: '/catalog', element: <ModuleCatalog /> },
      { path: '/analytics/pipelines', element: <PipelineAssignmentView /> },
      { path: '/analytics/runtime', element: <RuntimeObservabilityView /> },
      { path: '/runtime', element: <RuntimeObservabilityView /> },
      { path: '/settings', element: <Settings /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
  {
    path: '/login',
    element: (
      <GuestGuard>
        <Login />
      </GuestGuard>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestGuard>
        <Register />
      </GuestGuard>
    ),
  },
  {
    path: '/_devtools',
    element: (
      <Suspense fallback={<div style={{ padding: 24, color: '#38bdf8', background: '#030712', height: '100vh' }}>Loading DevTools Engine...</div>}>
        <DevToolsLayout />
      </Suspense>
    ),
    children: [
      { path: '', element: <DevToolsDashboardPage /> },
      { path: 'stores', element: <DevToolsStoresPage /> },
      { path: 'stores/:storeName', element: <DevToolsStoresPage /> },
      { path: 'signalr', element: <DevToolsSignalRPage /> },
      { path: 'dispatcher', element: <DevToolsDispatcherPage /> },
      { path: 'bootstrap', element: <DevToolsBootstrapPage /> },
      { path: 'performance', element: <DevToolsPerformancePage /> },
      { path: 'logs', element: <DevToolsLogsPage /> },
      { path: 'config', element: <DevToolsConfigPage /> },
    ],
  },
]);

export default router;
