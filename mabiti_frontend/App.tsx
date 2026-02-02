import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RentPage } from './pages/RentPage';
import { BuyPage } from './pages/BuyPage';
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

// Aurora Wrapper (only show on authenticated pages and when not in heavy 360 mode)
const AuroraWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);
    window.addEventListener('pause-aurora', handlePause);
    window.addEventListener('resume-aurora', handleResume);
    return () => {
      window.removeEventListener('pause-aurora', handlePause);
      window.removeEventListener('resume-aurora', handleResume);
    };
  }, []);

  if (!isAuthenticated || isPaused) return null;

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
            {/* LiquidGlass filter for better performance */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="1" seed="92" result="noise" />
                <feGaussianBlur in="noise" stdDeviation="1.5" result="blurred" />
                <feDisplacementMap in="SourceGraphic" in2="blurred" scale="50" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </svg>
            <Routes>
              {/* Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Redirect root to home */}
              <Route path="/" element={<Navigate to="/home" replace />} />

              {/* Protected Routes */}
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/buy" element={<ProtectedRoute><BuyPage /></ProtectedRoute>} />
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
