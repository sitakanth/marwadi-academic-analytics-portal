import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calculator, Target, TrendingUp, Trophy, MapPin,
  BarChart3, Brain, User, FileDown, ChevronLeft, ChevronRight,
  Sun, Moon, Presentation, GraduationCap
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { BRANDING } from '../../config/branding';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sgpa', label: 'SGPA Calculator', icon: Calculator },
  { path: '/cgpa', label: 'CGPA Calculator', icon: Target },
  { path: '/predictor', label: 'Grade Predictor', icon: TrendingUp },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/achievements', label: 'Achievements', icon: Trophy },
  { path: '/goals', label: 'Goal Planner', icon: MapPin },
  { path: '/heatmap', label: 'Heatmap', icon: BarChart3 },
  { path: '/intelligence', label: 'Grade Intelligence', icon: Brain },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/export', label: 'Export Report', icon: FileDown },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { state, dispatch } = useAcademic();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 h-full z-50 flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 lg:transition-none`}
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
            <GraduationCap size={20} color="white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="text-white font-bold text-sm leading-tight">{BRANDING.universityName}</div>
                <div className="text-blue-300/60 text-[10px] font-medium tracking-wider uppercase">Analytics Portal</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className="group relative flex items-center gap-3 rounded-xl transition-all duration-200"
                style={{
                  padding: collapsed ? '0.65rem' : '0.65rem 0.875rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(6,182,212,0.1))'
                    : 'transparent',
                  color: isActive ? '#60a5fa' : 'rgba(148,163,184,0.8)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                    style={{ height: '60%', background: 'linear-gradient(to bottom, #2563eb, #06b6d4)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs 
                    rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                    whitespace-nowrap z-[100]">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 space-y-2 border-t border-white/5 flex-shrink-0">
          {/* Seminar Mode */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SEMINAR_MODE' })}
            className="w-full flex items-center gap-3 rounded-xl transition-all duration-200"
            style={{
              padding: collapsed ? '0.65rem' : '0.65rem 0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: state.seminarMode
                ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(234,88,12,0.15))'
                : 'transparent',
              color: state.seminarMode ? '#f87171' : 'rgba(148,163,184,0.8)',
            }}
          >
            <Presentation size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Seminar Mode</span>}
          </button>

          {/* Dark Mode */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="w-full flex items-center gap-3 rounded-xl transition-all duration-200"
            style={{
              padding: collapsed ? '0.65rem' : '0.65rem 0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'rgba(148,163,184,0.8)',
            }}
          >
            {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span className="text-sm font-medium">{state.darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Collapse */}
          <button
            onClick={onToggle}
            className="w-full hidden lg:flex items-center gap-3 rounded-xl transition-all duration-200 hover:bg-white/5"
            style={{
              padding: collapsed ? '0.65rem' : '0.65rem 0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: 'rgba(148,163,184,0.8)',
            }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
