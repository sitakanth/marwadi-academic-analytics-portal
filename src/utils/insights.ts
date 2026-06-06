import type { SemesterResult, AcademicInsight } from '../types';
import { SEMESTERS } from '../data/semesters';
import {
  calculateCGPA,
  getHighestSGPA,
  getLowestSGPA,
  getPerformanceGrowth,
  getGradeDistribution,
} from './calculations';

export function generateInsights(results: SemesterResult[]): AcademicInsight[] {
  if (results.length === 0) return [];

  const insights: AcademicInsight[] = [];
  const sorted = [...results].sort((a, b) => a.semesterId - b.semesterId);
  const cgpa = calculateCGPA(results);
  const highest = getHighestSGPA(results);
  const lowest = getLowestSGPA(results);
  const growth = getPerformanceGrowth(results);
  const gradeDistribution = getGradeDistribution(results);

  // Strongest semester
  if (highest) {
    const semName = SEMESTERS.find(s => s.id === highest.semesterId)?.name ?? `Semester ${highest.semesterId}`;
    insights.push({
      id: 'strongest-semester',
      title: 'Strongest Semester',
      description: `Your strongest semester was ${semName} with an SGPA of ${highest.sgpa.toFixed(2)}.`,
      type: 'positive',
      icon: '💪',
      value: highest.sgpa.toFixed(2),
    });
  }

  // Weakest semester
  if (lowest && results.length > 1) {
    const semName = SEMESTERS.find(s => s.id === lowest.semesterId)?.name ?? `Semester ${lowest.semesterId}`;
    insights.push({
      id: 'weakest-semester',
      title: 'Growth Baseline',
      description: `${semName} was your starting baseline with SGPA ${lowest.sgpa.toFixed(2)} — consider it your growth foundation.`,
      type: 'info',
      icon: '📊',
      value: lowest.sgpa.toFixed(2),
    });
  }

  // Performance growth
  if (results.length >= 2) {
    const trend = growth > 0 ? 'improved' : growth < 0 ? 'declined' : 'remained stable';
    insights.push({
      id: 'performance-growth',
      title: 'Performance Trend',
      description: `Your performance ${trend} by ${Math.abs(growth)}% from ${SEMESTERS.find(s => s.id === sorted[0].semesterId)?.name} to ${SEMESTERS.find(s => s.id === sorted[sorted.length - 1].semesterId)?.name}.`,
      type: growth > 0 ? 'positive' : growth < 0 ? 'warning' : 'neutral',
      icon: growth > 0 ? '📈' : growth < 0 ? '📉' : '➡️',
      value: `${growth > 0 ? '+' : ''}${growth}%`,
    });
  }

  // Most improved semester
  if (sorted.length >= 2) {
    let bestImprovement = 0;
    let bestSemester = sorted[1].semesterId;
    for (let i = 1; i < sorted.length; i++) {
      const improvement = sorted[i].sgpa - sorted[i - 1].sgpa;
      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestSemester = sorted[i].semesterId;
      }
    }
    if (bestImprovement > 0) {
      const semName = SEMESTERS.find(s => s.id === bestSemester)?.name ?? `Semester ${bestSemester}`;
      insights.push({
        id: 'most-improved',
        title: 'Most Improved',
        description: `${semName} showed the highest improvement with a jump of ${bestImprovement.toFixed(2)} SGPA points.`,
        type: 'positive',
        icon: '🚀',
        value: `+${bestImprovement.toFixed(2)}`,
      });
    }
  }

  // Academic standing projection
  if (cgpa >= 9.5) {
    insights.push({
      id: 'distinction-track',
      title: 'Outstanding Track',
      description: 'You are on track for Outstanding classification at graduation. Exceptional performance!',
      type: 'positive',
      icon: '🏆',
    });
  } else if (cgpa >= 8.5) {
    insights.push({
      id: 'distinction-track',
      title: 'Distinction Track',
      description: 'You are on track for Distinction classification at graduation. Keep up the excellent work!',
      type: 'positive',
      icon: '🌟',
    });
  } else if (cgpa >= 7.5) {
    insights.push({
      id: 'first-class-track',
      title: 'First Class Track',
      description: 'You are on track for First Class at graduation. A small push could earn Distinction!',
      type: 'neutral',
      icon: '📘',
    });
  }

  // Most frequent grade
  const sortedGrades = Object.entries(gradeDistribution).sort(([, a], [, b]) => b - a);
  if (sortedGrades.length > 0) {
    const [topGrade, count] = sortedGrades[0];
    insights.push({
      id: 'frequent-grade',
      title: 'Most Frequent Grade',
      description: `Your most common grade is ${topGrade}, earned ${count} time${count > 1 ? 's' : ''} across all semesters.`,
      type: 'info',
      icon: '🎯',
      value: topGrade,
    });
  }

  // O grades count
  const oCount = gradeDistribution['O'] ?? 0;
  if (oCount > 0) {
    insights.push({
      id: 'o-grades',
      title: 'Outstanding Grades',
      description: `You earned ${oCount} Outstanding (O) grade${oCount > 1 ? 's' : ''} across all semesters — exceptional performance!`,
      type: 'positive',
      icon: '💎',
      value: `${oCount}`,
    });
  }

  // Consistency score
  if (results.length >= 2) {
    const sgpas = sorted.map(r => r.sgpa);
    const mean = sgpas.reduce((s, v) => s + v, 0) / sgpas.length;
    const variance = sgpas.reduce((s, v) => s + (v - mean) ** 2, 0) / sgpas.length;
    const consistency = Math.max(0, 100 - variance * 100);
    insights.push({
      id: 'consistency',
      title: 'Performance Consistency',
      description: `Your performance consistency score is ${consistency.toFixed(1)}%. ${consistency >= 90 ? 'Remarkably stable!' : consistency >= 70 ? 'Good consistency.' : 'Some variation across semesters.'}`,
      type: consistency >= 80 ? 'positive' : 'neutral',
      icon: '⚖️',
      value: `${consistency.toFixed(0)}%`,
    });
  }

  return insights;
}
