import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAcademic } from '../../context/AcademicContext';
import { APP_CONFIG } from '../../config/appConfig';
import { useKeyboardShortcut } from '../../hooks/useLocalStorage';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, dispatch } = useAcademic();
  const location = useLocation();
  const navigate = useNavigate();

  // Seminar mode keyboard shortcut
  useKeyboardShortcut('ctrl+shift+p', () => {
    dispatch({ type: 'TOGGLE_SEMINAR_MODE' });
  });

  // Auto-collapse sidebar in seminar mode
  useEffect(() => {
    if (state.seminarMode) {
      setSidebarCollapsed(true);
    }
  }, [state.seminarMode]);

  // Seminar mode auto-rotate
  useEffect(() => {
    if (!state.seminarMode) return;

    const pages: string[] = [...APP_CONFIG.seminarMode.rotatePages];
    let currentIndex = pages.indexOf(location.pathname);
    if (currentIndex === -1) currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % pages.length;
      navigate(pages[currentIndex]);
    }, APP_CONFIG.seminarMode.rotateIntervalMs);

    return () => clearInterval(interval);
  }, [state.seminarMode, navigate, location.pathname]);

  const currentSidebarWidth = sidebarCollapsed ? '72px' : '280px';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          marginLeft: `var(--current-sidebar-width, ${currentSidebarWidth})`,
          '--current-sidebar-width': currentSidebarWidth,
        } as React.CSSProperties}
      >
        <TopBar onMenuToggle={() => setMobileOpen(o => !o)} />

        <main
          className="min-h-screen"
          style={{
            paddingTop: 'var(--topbar-height)',
            transition: 'padding 0.25s ease',
          }}
        >
          {/* Seminar Mode Live Badge */}
          <AnimatePresence>
            {state.seminarMode && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="demo-badge"
              >
                ● LIVE DEMO MODE
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Content with Animated Transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Suspense
                fallback={
                  <div className="page-container flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: 'var(--primary-500)', borderTopColor: 'transparent' }} />
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</span>
                    </div>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Responsive sidebar width for mobile */}
      <style>{`
        @media (max-width: 1023px) {
          [style*="--current-sidebar-width"] {
            --current-sidebar-width: 0px !important;
            margin-left: 0 !important;
          }
          header[style*="--current-sidebar-width"],
          header {
            left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
