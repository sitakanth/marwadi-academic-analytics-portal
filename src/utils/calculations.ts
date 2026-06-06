import type { GradeEntry, SemesterResult, GoalPlanResult } from '../types';
import { GRADE_MAP } from '../config/gradeSystem';
import { SEMESTERS } from '../data/semesters';

export function calculateSGPA(grades: GradeEntry[]): number {
  const creditGrades = grades.filter(g => !g.isNonCredit && g.grade !== 'S');
  if (creditGrades.length === 0) return 0;

  const totalCredits = creditGrades.reduce((sum, g) => sum + g.credits, 0);
  if (totalCredits === 0) return 0;

  const totalGradePoints = creditGrades.reduce((sum, g) => {
    const points = GRADE_MAP[g.grade] ?? 0;
    return sum + g.credits * points;
  }, 0);

  return Math.round((totalGradePoints / totalCredits) * 100) / 100;
}

export function calculateCGPA(semesterResults: SemesterResult[]): number {
  if (semesterResults.length === 0) return 0;

  let totalWeightedPoints = 0;
  let totalCredits = 0;

  for (const result of semesterResults) {
    const semester = SEMESTERS.find(s => s.id === result.semesterId);
    if (!semester) continue;

    totalWeightedPoints += result.sgpa * semester.totalCredits;
    totalCredits += semester.totalCredits;
  }

  if (totalCredits === 0) return 0;
  return Math.round((totalWeightedPoints / totalCredits) * 100) / 100;
}

export function calculateCGPAFromSGPAs(sgpas: { semesterId: number; sgpa: number }[]): number {
  if (sgpas.length === 0) return 0;

  let totalWeightedPoints = 0;
  let totalCredits = 0;

  for (const entry of sgpas) {
    const semester = SEMESTERS.find(s => s.id === entry.semesterId);
    if (!semester || entry.sgpa <= 0) continue;

    totalWeightedPoints += entry.sgpa * semester.totalCredits;
    totalCredits += semester.totalCredits;
  }

  if (totalCredits === 0) return 0;
  return Math.round((totalWeightedPoints / totalCredits) * 100) / 100;
}

export function getTotalCreditsEarned(semesterResults: SemesterResult[]): number {
  return semesterResults.reduce((sum, r) => {
    const semester = SEMESTERS.find(s => s.id === r.semesterId);
    return sum + (semester?.totalCredits ?? 0);
  }, 0);
}

export function getHighestSGPA(semesterResults: SemesterResult[]): { sgpa: number; semesterId: number } | null {
  if (semesterResults.length === 0) return null;
  return semesterResults.reduce(
    (best, r) => (r.sgpa > best.sgpa ? { sgpa: r.sgpa, semesterId: r.semesterId } : best),
    { sgpa: 0, semesterId: 0 }
  );
}

export function getLowestSGPA(semesterResults: SemesterResult[]): { sgpa: number; semesterId: number } | null {
  if (semesterResults.length === 0) return null;
  return semesterResults.reduce(
    (worst, r) => (r.sgpa < worst.sgpa ? { sgpa: r.sgpa, semesterId: r.semesterId } : worst),
    { sgpa: Infinity, semesterId: 0 }
  );
}

export function calculateGoalPlan(
  currentResults: SemesterResult[],
  targetCGPA: number,
  remainingSemesters: number[] = []
): GoalPlanResult {
  const currentCredits = currentResults.reduce((sum, r) => {
    const sem = SEMESTERS.find(s => s.id === r.semesterId);
    return sum + (sem?.totalCredits ?? 0);
  }, 0);

  const currentWeightedSum = currentResults.reduce((sum, r) => {
    const sem = SEMESTERS.find(s => s.id === r.semesterId);
    return sum + r.sgpa * (sem?.totalCredits ?? 0);
  }, 0);

  const remainingCredits = remainingSemesters.reduce((sum, semId) => {
    const sem = SEMESTERS.find(s => s.id === semId);
    return sum + (sem?.totalCredits ?? 0);
  }, 0);

  const totalCredits = currentCredits + remainingCredits;
  const requiredWeightedSum = targetCGPA * totalCredits;
  const requiredSGPA =
    remainingCredits > 0
      ? Math.round(((requiredWeightedSum - currentWeightedSum) / remainingCredits) * 100) / 100
      : 0;

  let feasibility: GoalPlanResult['feasibility'];
  if (requiredSGPA <= 8.0) feasibility = 'achievable';
  else if (requiredSGPA <= 9.0) feasibility = 'challenging';
  else if (requiredSGPA <= 10.0) feasibility = 'extremely-challenging';
  else feasibility = 'impossible';

  return {
    targetCGPA,
    currentCGPA: calculateCGPA(currentResults),
    requiredSGPA: Math.max(0, requiredSGPA),
    feasibility,
    currentCredits,
    remainingCredits,
  };
}

export function getGradeDistribution(results: SemesterResult[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  for (const result of results) {
    for (const grade of result.grades) {
      if (grade.isNonCredit) continue;
      distribution[grade.grade] = (distribution[grade.grade] ?? 0) + 1;
    }
  }
  return distribution;
}

export function getPerformanceGrowth(results: SemesterResult[]): number {
  if (results.length < 2) return 0;
  const sorted = [...results].sort((a, b) => a.semesterId - b.semesterId);
  const first = sorted[0].sgpa;
  const last = sorted[sorted.length - 1].sgpa;
  if (first === 0) return 0;
  return Math.round(((last - first) / first) * 100 * 10) / 10;
}
