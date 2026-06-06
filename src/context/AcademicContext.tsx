import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, SemesterResult, StudentProfile } from '../types';

const STORAGE_KEY = 'mu-academic-portal-state';

const defaultProfile: StudentProfile = {
  name: '',
  enrollmentNumber: '',
  department: 'Computer Application',
  batch: '2024-2028',
  avatarColor: '#3B82F6',
};

const initialState: AppState = {
  profile: defaultProfile,
  semesterResults: {},
  darkMode: false,
  seminarMode: false,
  hasSeenLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_SEMESTER_RESULT':
      return {
        ...state,
        semesterResults: {
          ...state.semesterResults,
          [action.payload.semesterId]: action.payload,
        },
      };
    case 'CLEAR_SEMESTER_RESULT': {
      const newResults = { ...state.semesterResults };
      delete newResults[action.payload];
      return { ...state, semesterResults: newResults };
    }
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'TOGGLE_SEMINAR_MODE':
      return { ...state, seminarMode: !state.seminarMode };
    case 'SET_HAS_SEEN_LOADING':
      return { ...state, hasSeenLoading: true };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'RESET_ALL':
      return { ...initialState, darkMode: state.darkMode };
    default:
      return state;
  }
}

interface AcademicContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  getSemesterResults: () => SemesterResult[];
  getResultForSemester: (semesterId: number) => SemesterResult | undefined;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

function loadFromStorage(): Partial<AppState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return null;
}

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, (init) => {
    const stored = loadFromStorage();
    if (stored) {
      return { ...init, ...stored, hasSeenLoading: false };
    }
    return init;
  });

  useEffect(() => {
    const toStore: Partial<AppState> = {
      profile: state.profile,
      semesterResults: state.semesterResults,
      darkMode: state.darkMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [state.profile, state.semesterResults, state.darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  const getSemesterResults = (): SemesterResult[] => {
    return Object.values(state.semesterResults).sort(
      (a, b) => a.semesterId - b.semesterId
    );
  };

  const getResultForSemester = (semesterId: number): SemesterResult | undefined => {
    return state.semesterResults[semesterId];
  };

  return (
    <AcademicContext.Provider value={{ state, dispatch, getSemesterResults, getResultForSemester }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic(): AcademicContextType {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within AcademicProvider');
  }
  return context;
}
