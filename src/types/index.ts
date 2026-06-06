export interface Subject {
  name: string;
  credits: number;
  isNonCredit: boolean;
}

export interface Semester {
  id: number;
  name: string;
  subjects: Subject[];
  totalCredits: number;
}

export interface GradeEntry {
  subjectName: string;
  grade: string;
  credits: number;
  isNonCredit: boolean;
}

export interface SemesterResult {
  semesterId: number;
  grades: GradeEntry[];
  sgpa: number;
  totalCredits: number;
  totalGradePoints: number;
}

export interface StudentProfile {
  name: string;
  enrollmentNumber: string;
  department: string;
  batch: string;
  avatarColor: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  condition: string;
}

export interface AcademicInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'warning' | 'info';
  icon: string;
  value?: string;
}

export interface GoalPlanResult {
  targetCGPA: number;
  currentCGPA: number;
  requiredSGPA: number;
  feasibility: 'achievable' | 'challenging' | 'extremely-challenging' | 'impossible';
  currentCredits: number;
  remainingCredits: number;
}

export interface TimelineEvent {
  semester: number;
  sgpa: number;
  label: string;
  achievement?: string;
  growth?: number;
}

export interface CommandItem {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: string;
  keywords: string[];
}

export interface AppState {
  profile: StudentProfile;
  semesterResults: Record<number, SemesterResult>;
  darkMode: boolean;
  seminarMode: boolean;
  hasSeenLoading: boolean;
}

export type AppAction =
  | { type: 'SET_PROFILE'; payload: StudentProfile }
  | { type: 'SET_SEMESTER_RESULT'; payload: SemesterResult }
  | { type: 'CLEAR_SEMESTER_RESULT'; payload: number }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_SEMINAR_MODE' }
  | { type: 'SET_HAS_SEEN_LOADING' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'RESET_ALL' };
