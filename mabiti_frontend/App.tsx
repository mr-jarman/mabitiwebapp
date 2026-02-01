import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RentPage } from './pages/RentPage';
import { AiPage } from './pages/AiPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { LoginPage } from './pages/LoginPage';
import { SellPage } from './pages/SellPage';

import Aurora from './components/Aurora';

import { VisualizerProvider } from './services/VisualizerContext';
import { ThemeProvider } from './services/ThemeContext';
import { AuthProvider, useAuth } from './services/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Aurora Wrapper (only show on authenticated pages)
const AuroraWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <div className="aurora-container fixed top-0 left-0 right-0 h-[35vh] pointer-events-none z-20 overflow-hidden opacity-60 select-none">
      <Aurora
        colorStops={["#7cff67", "#B19EEF", "#5227FF"]}
        blend={0.5}
        amplitude={1.0}
        speed={1}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VisualizerProvider>
          <BrowserRouter>
            <AuroraWrapper />
            <Routes>
              {/* Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Protected Routes */}
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/rent" element={<ProtectedRoute><RentPage /></ProtectedRoute>} />
              <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute><AiPage /></ProtectedRoute>} />
              <Route path="/property/:id" element={<ProtectedRoute><PropertyDetailPage /></ProtectedRoute>} />

              {/* Fallback to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </VisualizerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
