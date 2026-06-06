import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, Command, X } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import type { CommandItem } from '../../types';

interface TopBarProps {
  onMenuToggle: () => void;
}

const commandItems: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Academic overview', path: '/dashboard', icon: '📊', keywords: ['dashboard', 'home', 'overview'] },
  { id: 'sgpa', label: 'SGPA Calculator', description: 'Calculate semester GPA', path: '/sgpa', icon: '🧮', keywords: ['sgpa', 'calculator', 'semester', 'grades'] },
  { id: 'cgpa', label: 'CGPA Calculator', description: 'Calculate cumulative GPA', path: '/cgpa', icon: '🎯', keywords: ['cgpa', 'cumulative', 'overall'] },
  { id: 'predictor', label: 'Grade Predictor', description: 'Predict expected results', path: '/predictor', icon: '🔮', keywords: ['predict', 'expected', 'forecast'] },
  { id: 'analytics', label: 'Analytics', description: 'Performance insights', path: '/analytics', icon: '📈', keywords: ['analytics', 'insights', 'analysis', 'trends'] },
  { id: 'achievements', label: 'Achievements', description: 'Academic badges', path: '/achievements', icon: '🏆', keywords: ['achievements', 'badges', 'awards'] },
  { id: 'goals', label: 'Goal Planner', description: 'Set academic targets', path: '/goals', icon: '🗺️', keywords: ['goal', 'planner', 'target', 'plan'] },
  { id: 'heatmap', label: 'Performance Heatmap', description: 'Visual performance map', path: '/heatmap', icon: '🗓️', keywords: ['heatmap', 'heat', 'map'] },
  { id: 'intelligence', label: 'Grade Intelligence', description: 'Smart grade analysis', path: '/intelligence', icon: '🧠', keywords: ['intelligence', 'smart', 'grade', 'analysis'] },
  { id: 'profile', label: 'Student Profile', description: 'Personal information', path: '/profile', icon: '👤', keywords: ['profile', 'student', 'personal'] },
  { id: 'export', label: 'Export Report', description: 'Generate PDF report', path: '/export', icon: '📄', keywords: ['export', 'pdf', 'report', 'download'] },
  { id: 'dark', label: 'Toggle Dark Mode', description: 'Switch theme', path: '__dark__', icon: '🌙', keywords: ['dark', 'light', 'theme', 'mode'] },
  { id: 'seminar', label: 'Toggle Seminar Mode', description: 'Presentation mode', path: '__seminar__', icon: '🎪', keywords: ['seminar', 'demo', 'present', 'presentation'] },
];

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { state, dispatch } = useAcademic();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? commandItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : commandItems;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const executeCommand = (item: CommandItem) => {
    setSearchOpen(false);
    if (item.path === '__dark__') {
      dispatch({ type: 'TOGGLE_DARK_MODE' });
    } else if (item.path === '__seminar__') {
      dispatch({ type: 'TOGGLE_SEMINAR_MODE' });
    } else {
      navigate(item.path);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      executeCommand(filtered[selectedIndex]);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 right-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-6"
        style={{
          left: 'var(--current-sidebar-width, 280px)',
          height: 'var(--topbar-height)',
          background: 'var(--bg-topbar)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          transition: 'left 0.25s ease',
        }}
      >
        {/* Mobile Menu Button */}
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <Menu size={22} style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Search Bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl max-w-md flex-1 transition-all"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
          }}
        >
          <Search size={16} />
          <span className="text-sm hidden sm:inline">Search features...</span>
          <span className="text-sm sm:hidden">Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 ml-auto rounded text-[10px] font-medium"
            style={{ background: 'var(--border-color)', color: 'var(--text-secondary)' }}>
            <Command size={10} /> K
          </kbd>
        </button>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {state.profile.name && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: state.profile.avatarColor }}>
                {state.profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {state.profile.name}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button onClick={() => setSearchOpen(false)} className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
                  <X size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => executeCommand(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: index === selectedIndex ? 'var(--primary-500)' : 'transparent',
                      color: index === selectedIndex ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      <div className="text-xs truncate" style={{ opacity: 0.7 }}>{item.description}</div>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No results found
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
