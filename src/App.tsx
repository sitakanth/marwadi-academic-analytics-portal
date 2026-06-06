import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import { APP_CONFIG } from './config/appConfig';
import MainLayout from './components/layout/MainLayout';

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SGPACalculator = lazy(() => import('./pages/SGPACalculator'));
const CGPACalculator = lazy(() => import('./pages/CGPACalculator'));
const Predictor = lazy(() => import('./pages/Predictor'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Achievements = lazy(() => import('./pages/Achievements'));
const GoalPlanner = lazy(() => import('./pages/GoalPlanner'));
const Heatmap = lazy(() => import('./pages/Heatmap'));
const GradeIntelligence = lazy(() => import('./pages/GradeIntelligence'));
const Profile = lazy(() => import('./pages/Profile'));
const Export = lazy(() => import('./pages/Export'));
const LoadingScreen = lazy(() => import('./pages/LoadingScreen'));

function AppContent() {
  const { state, dispatch } = useAcademic();
  const [showLoading, setShowLoading] = useState(!state.hasSeenLoading);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    dispatch({ type: 'SET_HAS_SEEN_LOADING' });
  };

  // Fallback: max loading time
  useEffect(() => {
    if (showLoading) {
      const timeout = setTimeout(handleLoadingComplete, APP_CONFIG.loading.maxDurationMs);
      return () => clearTimeout(timeout);
    }
  }, [showLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoading && (
          <Suspense fallback={null}>
            <LoadingScreen onComplete={handleLoadingComplete} />
          </Suspense>
        )}
      </AnimatePresence>

      {!showLoading && (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sgpa" element={<SGPACalculator />} />
            <Route path="/cgpa" element={<CGPACalculator />} />
            <Route path="/predictor" element={<Predictor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/goals" element={<GoalPlanner />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/intelligence" element={<GradeIntelligence />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/export" element={<Export />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AcademicProvider>
        <AppContent />
      </AcademicProvider>
    </BrowserRouter>
  );
}
