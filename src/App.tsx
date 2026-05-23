import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppState } from './context/AppContext';
import { Login } from './pages/auth/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';

// Root security router resolver
const RootRouteRedirect: React.FC = () => {
  const { currentUser } = useAppState();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/candidate" replace />;
};

// Route Security Guards
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAppState();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/candidate" replace />;
  }

  return <>{children}</>;
};

const CandidateGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAppState();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'candidate') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Entrance */}
          <Route path="/login" element={<Login />} />

          {/* Recruiter Workspace Protected Route */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />

          {/* Candidate Workspace Protected Route */}
          <Route
            path="/candidate"
            element={
              <CandidateGuard>
                <CandidateDashboard />
              </CandidateGuard>
            }
          />

          {/* Root dynamic redirector */}
          <Route path="/" element={<RootRouteRedirect />} />

          {/* Fallback resolver */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
