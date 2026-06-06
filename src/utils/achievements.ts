import type { SemesterResult, Achievement } from '../types';
import { SEMESTERS } from '../data/semesters';
import { calculateCGPA } from './calculations';

export function evaluateAchievements(results: SemesterResult[]): Achievement[] {
  const cgpa = calculateCGPA(results);
  const sortedResults = [...results].sort((a, b) => a.semesterId - b.semesterId);
  const sgpas = sortedResults.map(r => r.sgpa);
  
  let totalOGrades = 0;
  for (const r of results) {
    for (const g of r.grades) {
      if (!g.isNonCredit && g.grade === 'O') totalOGrades++;
    }
  }

  const totalCredits = results.reduce((sum, r) => {
    const sem = SEMESTERS.find(s => s.id === r.semesterId);
    return sum + (sem?.totalCredits ?? 0);
  }, 0);

  const TOTAL_PROGRAM = 165;

  // Check if Major Project-1 completed or Semester 8 result exists
  const hasMajorProject1 = results.some(r => 
    r.semesterId === 7 && r.grades.some(g => g.subjectName === 'Major Project - 1')
  );
  const hasSem8Result = results.some(r => r.semesterId === 8);

  const achievements: Achievement[] = [
    {
      id: 'credit-champion',
      title: 'Credit Champion',
      description: 'Completed more than 100 credits',
      icon: '🎯',
      color: '#F59E0B',
      unlocked: totalCredits >= 100,
      condition: '≥ 100 credits completed',
    },
    {
      id: 'degree-progress-50',
      title: 'Degree Progress 50%',
      description: 'Completed 50% of total program credits',
      icon: '📊',
      color: '#06B6D4',
      unlocked: totalCredits >= TOTAL_PROGRAM * 0.5,
      condition: `≥ ${(TOTAL_PROGRAM * 0.5).toFixed(1)} credits`,
    },
    {
      id: 'degree-progress-75',
      title: 'Degree Progress 75%',
      description: 'Completed 75% of total program credits',
      icon: '🚀',
      color: '#3B82F6',
      unlocked: totalCredits >= TOTAL_PROGRAM * 0.75,
      condition: `≥ ${(TOTAL_PROGRAM * 0.75).toFixed(2)} credits`,
    },
    {
      id: 'final-year-ready',
      title: 'Final Year Ready',
      description: 'Completed 75% of total program credits — ready for final year',
      icon: '🎓',
      color: '#6366F1',
      unlocked: totalCredits >= TOTAL_PROGRAM * 0.75,
      condition: `≥ 75% of ${TOTAL_PROGRAM} credits`,
    },
    {
      id: 'academic-excellence',
      title: 'Academic Excellence',
      description: 'Achieved CGPA of 9.5 or above',
      icon: '🏆',
      color: '#D4AF37',
      unlocked: cgpa >= 9.5,
      condition: 'CGPA ≥ 9.5',
    },
    {
      id: 'distinction-holder',
      title: 'Distinction Holder',
      description: 'Achieved CGPA of 8.5 or above',
      icon: '🌟',
      color: '#10B981',
      unlocked: cgpa >= 8.5,
      condition: 'CGPA ≥ 8.5',
    },
    {
      id: 'consistent-performer',
      title: 'Consistent Performer',
      description: 'All entered semester SGPAs are 9.0 or above',
      icon: '⭐',
      color: '#8B5CF6',
      unlocked: sgpas.length > 0 && sgpas.every(s => s >= 9.0),
      condition: 'All SGPAs ≥ 9.0',
    },
    {
      id: 'top-performer',
      title: 'Top Performer',
      description: 'Earned 5 or more Outstanding (O) grades',
      icon: '💎',
      color: '#EC4899',
      unlocked: totalOGrades >= 5,
      condition: '≥ 5 O grades',
    },
    {
      id: 'project-phase-ready',
      title: 'Project Phase Ready',
      description: 'Major Project-1 completed or Semester 8 result exists',
      icon: '🔬',
      color: '#F97316',
      unlocked: hasMajorProject1 || hasSem8Result,
      condition: 'Major Project-1 or Semester 8 completed',
    },
    {
      id: 'graduation-ready',
      title: 'Graduation Ready',
      description: `Completed all ${TOTAL_PROGRAM} program credits`,
      icon: '👑',
      color: '#14B8A6',
      unlocked: totalCredits >= TOTAL_PROGRAM,
      condition: `≥ ${TOTAL_PROGRAM} credits completed`,
    },
  ];

  return achievements.map(a => ({
    ...a,
    unlockedAt: a.unlocked ? new Date().toISOString() : undefined,
  }));
}
