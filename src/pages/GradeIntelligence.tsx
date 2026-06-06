import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Star, TrendingUp, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAcademic } from '../context/AcademicContext';
import {
  getGradeDistribution,
  getPerformanceGrowth,
} from '../utils/calculations';
import { GRADE_MAP, GRADE_OPTIONS } from '../config/gradeSystem';
import { getSemesterById } from '../data/semesters';
import EmptyState from '../components/ui/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function GradeIntelligence() {
  const { getSemesterResults } = useAcademic();
  const results = getSemesterResults();

  const distribution = useMemo(() => getGradeDistribution(results), [results]);
  const growth = useMemo(() => getPerformanceGrowth(results), [results]);

  const chartData = useMemo(() => {
    return GRADE_OPTIONS.map((g) => ({
      grade: g.grade,
      count: distribution[g.grade] ?? 0,
      color: g.color,
      label: g.label,
    }));
  }, [distribution]);

  const sortedGrades = useMemo(() => Object.entries(distribution).sort(([, a], [, b]) => b - a), [distribution]);
  const mostFrequent = sortedGrades.length > 0 ? sortedGrades[0] : null;

  // All subjects across semesters sorted by grade points
  const allSubjects = useMemo(() => {
    const subjects: Array<{ name: string; grade: string; points: number; semester: string; credits: number }> = [];
    for (const result of results) {
      const semName = getSemesterById(result.semesterId)?.name ?? `Semester ${result.semesterId}`;
      for (const g of result.grades) {
        if (g.isNonCredit) continue;
        subjects.push({
          name: g.subjectName,
          grade: g.grade,
          points: GRADE_MAP[g.grade] ?? 0,
          semester: semName,
          credits: g.credits,
        });
      }
    }
    return subjects.sort((a, b) => b.points - a.points);
  }, [results]);

  const bestSubject = allSubjects.length > 0 ? allSubjects[0] : null;
  const worstSubject = allSubjects.length > 0 ? allSubjects[allSubjects.length - 1] : null;

  // Consistency score
  const consistencyScore = useMemo(() => {
    if (results.length < 2) return 100;
    const sgpas = results.map((r) => r.sgpa);
    const mean = sgpas.reduce((s, v) => s + v, 0) / sgpas.length;
    const variance = sgpas.reduce((s, v) => s + (v - mean) ** 2, 0) / sgpas.length;
    return Math.max(0, 100 - variance * 100);
  }, [results]);

  // Per-semester grade breakdown
  const semesterBreakdowns = useMemo(() => {
    return results.map((r) => {
      const semName = getSemesterById(r.semesterId)?.name ?? `Semester ${r.semesterId}`;
      const gradeCount: Record<string, number> = {};
      for (const g of r.grades) {
        if (g.isNonCredit) continue;
        gradeCount[g.grade] = (gradeCount[g.grade] ?? 0) + 1;
      }
      return { semName, gradeCount, sgpa: r.sgpa };
    });
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          title="No Grade Data"
          description="Enter your semester grades to unlock grade distribution intelligence."
          actionLabel="Enter Grades"
          actionPath="/sgpa"
          icon="🧠"
        />
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Most Frequent Grade',
      value: mostFrequent ? `${mostFrequent[0]} (×${mostFrequent[1]})` : '—',
      icon: <Star size={20} />,
      color: '#D4AF37',
    },
    {
      label: 'Best Subject',
      value: bestSubject ? bestSubject.name : '—',
      sub: bestSubject ? `${bestSubject.grade} · ${bestSubject.semester}` : '',
      icon: <TrendingUp size={20} />,
      color: '#10B981',
    },
    {
      label: 'Most Challenging Subject',
      value: worstSubject ? worstSubject.name : '—',
      sub: worstSubject ? `${worstSubject.grade} · ${worstSubject.semester}` : '',
      icon: <BarChart2 size={20} />,
      color: '#F59E0B',
    },
    {
      label: 'Academic Growth',
      value: `${growth > 0 ? '+' : ''}${growth}%`,
      icon: <TrendingUp size={20} />,
      color: growth >= 0 ? '#10B981' : '#EF4444',
    },
    {
      label: 'Consistency Score',
      value: `${consistencyScore.toFixed(0)}%`,
      icon: <Brain size={20} />,
      color: '#8B5CF6',
    },
  ];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain size={28} style={{ color: 'var(--primary-500)' }} />
          Grade Distribution Intelligence
        </h1>
        <p className="page-subtitle">Deep analysis of your grade patterns and academic strengths</p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div className="grid-kpi" style={{ marginBottom: '2rem' }} variants={containerVariants} initial="hidden" animate="visible">
        {statsCards.map((card) => (
          <motion.div key={card.label} className="glass-card" style={{ padding: '1.25rem' }} variants={itemVariants}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${card.color}18`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.value}
            </div>
            {'sub' in card && card.sub && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {card.sub}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Grade Frequency Bar Chart */}
      <motion.div
        className="chart-card"
        style={{ marginBottom: '2rem' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          📊 Grade Frequency Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="grade" tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
              }}
              formatter={((value: any, _name: any, props: any) => [
                `${value} subject${value !== 1 ? 's' : ''}`,
                props.payload.label,
              ]) as any}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={52}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Subject-wise Performance */}
        <motion.div
          className="glass-card"
          style={{ padding: '1.25rem', maxHeight: 480, overflowY: 'auto' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', position: 'sticky', top: 0, background: 'var(--bg-card)', paddingBottom: '0.5rem' }}>
            📋 Subject-wise Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {allSubjects.map((sub, i) => {
              const gradeInfo = GRADE_OPTIONS.find((g) => g.grade === sub.grade);
              return (
                <div
                  key={`${sub.name}-${i}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {sub.semester} · {sub.credits} credits
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: gradeInfo ? `${gradeInfo.color}20` : 'var(--border-color)',
                      color: gradeInfo?.color ?? 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      flexShrink: 0,
                    }}
                  >
                    {sub.grade}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Per-semester Grade Breakdown */}
        <motion.div
          className="glass-card"
          style={{ padding: '1.25rem', maxHeight: 480, overflowY: 'auto' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', position: 'sticky', top: 0, background: 'var(--bg-card)', paddingBottom: '0.5rem' }}>
            📅 Per-Semester Grade Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {semesterBreakdowns.map((sem) => (
              <div key={sem.semName}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sem.semName}
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                    SGPA: {sem.sgpa.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {Object.entries(sem.gradeCount).sort(([a], [b]) => (GRADE_MAP[b] ?? 0) - (GRADE_MAP[a] ?? 0)).map(([grade, count]) => {
                    const gradeInfo = GRADE_OPTIONS.find((g) => g.grade === grade);
                    return (
                      <span
                        key={grade}
                        className="badge"
                        style={{
                          background: gradeInfo ? `${gradeInfo.color}18` : 'var(--border-color)',
                          color: gradeInfo?.color ?? 'var(--text-secondary)',
                          fontWeight: 700,
                        }}
                      >
                        {grade} ×{count}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
