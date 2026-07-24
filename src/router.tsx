import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { FullLayout } from './layouts/FullLayout';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Cameras } from './views/Cameras';
import { Rooms } from './views/Rooms';
import { Login } from './views/Login';
import { Register } from './views/Register';

// Auth Guard: Redirects to /login if user is not authenticated
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Guest Guard: Redirects to /dashboard if user is already authenticated
const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  console.log("isLoggedIn", isLoggedIn)
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

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
      { path: '/cameras', element: <Cameras /> },
      { path: '/rooms', element: <Rooms /> },
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
]);

export default router;
