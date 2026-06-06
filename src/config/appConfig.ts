export const APP_CONFIG = {
  loading: {
    minDurationMs: 800,
    maxDurationMs: 2000,
  },
  seminarMode: {
    rotateIntervalMs: 5000,
    rotatePages: ['/dashboard', '/analytics', '/achievements', '/goals', '/heatmap'],
    keyboardShortcut: 'Ctrl+Shift+P',
  },
  animations: {
    pageTransitionDuration: 0.3,
    counterDuration: 1.5,
    staggerDelay: 0.1,
    cardHoverScale: 1.02,
  },
  commandSearch: {
    keyboardShortcut: 'Ctrl+K',
    maxRecentSearches: 5,
  },
  pdf: {
    pageWidth: 210,
    pageHeight: 297,
    margin: 20,
  },
  totalProgramCredits: 165,
  maxSemesters: 8,
} as const;
