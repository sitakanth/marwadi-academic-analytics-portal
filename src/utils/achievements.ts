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

  const isImproving = sgpas.length >= 2 && sgpas.every((s, i) => i === 0 || s >= sgpas[i - 1]);

  const achievements: Achievement[] = [
    {
      id: 'academic-excellence',
      title: 'Academic Excellence',
      description: 'Achieved CGPA greater than 9.5',
      icon: '🏆',
      color: '#D4AF37',
      unlocked: cgpa > 9.5,
      condition: 'CGPA > 9.5',
    },
    {
      id: 'consistent-performer',
      title: 'Consistent Performer',
      description: 'All semester SGPAs above 9.0',
      icon: '⭐',
      color: '#10B981',
      unlocked: sgpas.length > 0 && sgpas.every(s => s >= 9.0),
      condition: 'All SGPAs ≥ 9.0',
    },
    {
      id: 'rising-star',
      title: 'Rising Star',
      description: 'Continuous improvement across semesters',
      icon: '🚀',
      color: '#3B82F6',
      unlocked: sgpas.length >= 2 && isImproving,
      condition: 'Each SGPA > previous',
    },
    {
      id: 'top-performer',
      title: 'Top Performer',
      description: 'Earned 5 or more Outstanding (O) grades',
      icon: '💎',
      color: '#8B5CF6',
      unlocked: totalOGrades >= 5,
      condition: '≥ 5 O grades',
    },
    {
      id: 'distinction-holder',
      title: 'Distinction Holder',
      description: 'Achieved CGPA of 8.5 or above',
      icon: '🌟',
      color: '#06B6D4',
      unlocked: cgpa >= 8.5,
      condition: 'CGPA ≥ 8.5',
    },
    {
      id: 'credit-champion',
      title: 'Credit Champion',
      description: 'Completed more than 100 credits',
      icon: '🎯',
      color: '#F59E0B',
      unlocked: totalCredits > 100,
      condition: '> 100 credits completed',
    },
    {
      id: 'perfect-semester',
      title: 'Perfect Semester',
      description: 'Achieved 10.0 SGPA in any semester',
      icon: '👑',
      color: '#EC4899',
      unlocked: sgpas.some(s => s === 10.0),
      condition: 'Any SGPA = 10.0',
    },
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Completed your first semester',
      icon: '🎓',
      color: '#6366F1',
      unlocked: results.length >= 1,
      condition: '≥ 1 semester completed',
    },
  ];

  return achievements.map(a => ({
    ...a,
    unlockedAt: a.unlocked ? new Date().toISOString() : undefined,
  }));
}
