import React from 'react';
import { Navigate } from 'react-router';

// Auth Guard: Redirects to /login if user is not authenticated
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Guest Guard: Redirects to /dashboard if user is already authenticated
export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};
