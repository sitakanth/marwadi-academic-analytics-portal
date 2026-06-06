export interface GradeInfo {
  grade: string;
  points: number;
  label: string;
  color: string;
}

export const GRADE_MAP: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'D': 4,
  'F': 0,
};

export const GRADE_OPTIONS: GradeInfo[] = [
  { grade: 'O', points: 10, label: 'Outstanding', color: '#10B981' },
  { grade: 'A+', points: 9, label: 'Excellent', color: '#34D399' },
  { grade: 'A', points: 8, label: 'Very Good', color: '#3B82F6' },
  { grade: 'B+', points: 7, label: 'Good', color: '#6366F1' },
  { grade: 'B', points: 6, label: 'Above Average', color: '#8B5CF6' },
  { grade: 'C', points: 5, label: 'Average', color: '#F59E0B' },
  { grade: 'D', points: 4, label: 'Below Average', color: '#F97316' },
  { grade: 'F', points: 0, label: 'Fail', color: '#EF4444' },
];

export const NON_CREDIT_GRADE = 'S';

export const ACADEMIC_STANDINGS = [
  { min: 9.5, label: 'Outstanding', color: '#10B981', icon: '🏆' },
  { min: 8.5, label: 'Distinction', color: '#34D399', icon: '🌟' },
  { min: 7.5, label: 'First Class', color: '#3B82F6', icon: '📘' },
  { min: 6.5, label: 'Second Class', color: '#6366F1', icon: '📗' },
  { min: 5.5, label: 'Pass', color: '#F59E0B', icon: '📙' },
  { min: 4.0, label: 'Pass', color: '#F97316', icon: '📕' },
  { min: 0, label: 'Fail', color: '#EF4444', icon: '❌' },
] as const;

export function getAcademicStanding(cgpa: number): { label: string; color: string; icon: string } {
  for (const standing of ACADEMIC_STANDINGS) {
    if (cgpa >= standing.min) {
      return { label: standing.label, color: standing.color, icon: standing.icon };
    }
  }
  return { label: 'N/A', color: '#6B7280', icon: '—' };
}

export function cgpaToPercentage(cgpa: number): number {
  return Math.round(cgpa * 10 * 100) / 100;
}
