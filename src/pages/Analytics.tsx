import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Target, Layers, Zap, BookOpen } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAcademic } from '../context/AcademicContext';
import { generateInsights } from '../utils/insights';
import {
  calculateCGPA,
  getTotalCreditsEarned,
  getPerformanceGrowth,
  getHighestSGPA,
  getLowestSGPA,
  getGradeDistribution,
} from '../utils/calculations';
import { GRADE_OPTIONS } from '../config/gradeSystem';
import { SEMESTERS, TOTAL_PROGRAM_CREDITS } from '../data/semesters';
import EmptyState from '../components/ui/EmptyState';
import type { AcademicInsight } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getBorderColor(type: AcademicInsight['type']): string {
  switch (type) {
    case 'positive':
      return '#10B981';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    case 'neutral':
    default:
      return '#6B7280';
  }
}

function getBgTint(type: AcademicInsight['type']): string {
  switch (type) {
    case 'positive':
      return 'rgba(16,185,129,0.06)';
    case 'warning':
      return 'rgba(245,158,11,0.06)';
    case 'info':
      return 'rgba(59,130,246,0.06)';
    case 'neutral':
    default:
      return 'rgba(107,114,128,0.04)';
  }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        boxShadow: '0 8px 24px var(--shadow-color)',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: '0.875rem', fontWeight: 700, color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { getSemesterResults } = useAcademic();
  const results = getSemesterResults();

  const insights = useMemo(() => generateInsights(results), [results]);
  const cgpa = useMemo(() => calculateCGPA(results), [results]);
  const totalCredits = useMemo(() => getTotalCreditsEarned(results), [results]);
  const growth = useMemo(() => getPerformanceGrowth(results), [results]);
  const highest = useMemo(() => getHighestSGPA(results), [results]);
  const lowest = useMemo(() => getLowestSGPA(results), [results]);
  const gradeDistribution = useMemo(() => getGradeDistribution(results), [results]);

  const creditCompletion = useMemo(
    () => Math.round((totalCredits / TOTAL_PROGRAM_CREDITS) * 100 * 10) / 10,
    [totalCredits],
  );

  const consistencyScore = useMemo(() => {
    if (results.length < 2) return 100;
    const sgpas = results.map((r) => r.sgpa);
    const mean = sgpas.reduce((s, v) => s + v, 0) / sgpas.length;
    const variance = sgpas.reduce((s, v) => s + (v - mean) ** 2, 0) / sgpas.length;
    return Math.max(0, 100 - variance * 100);
  }, [results]);

  // Most improved semester
  const mostImproved = useMemo(() => {
    if (results.length < 2) return null;
    const sorted = [...results].sort((a, b) => a.semesterId - b.semesterId);
    let best = { improvement: 0, semesterId: 0 };
    for (let i = 1; i < sorted.length; i++) {
      const diff = sorted[i].sgpa - sorted[i - 1].sgpa;
      if (diff > best.improvement) {
        best = { improvement: diff, semesterId: sorted[i].semesterId };
      }
    }
    return best.improvement > 0 ? best : null;
  }, [results]);

  // Most frequent grade
  const mostFrequentGrade = useMemo(() => {
    const sorted = Object.entries(gradeDistribution).sort(([, a], [, b]) => b - a);
    return sorted.length > 0 ? sorted[0] : null;
  }, [gradeDistribution]);

  // CGPA trend data (cumulative across semesters)
  const cgpaTrendData = useMemo(() => {
    const sorted = [...results].sort((a, b) => a.semesterId - b.semesterId);
    let totalWeighted = 0;
    let totalCr = 0;
    return sorted.map((r) => {
      const sem = SEMESTERS.find((s) => s.id === r.semesterId);
      const credits = sem?.totalCredits ?? 0;
      totalWeighted += r.sgpa * credits;
      totalCr += credits;
      const cumulativeCGPA = totalCr > 0 ? Math.round((totalWeighted / totalCr) * 100) / 100 : 0;
      return {
        name: sem?.name ?? `Sem ${r.semesterId}`,
        SGPA: r.sgpa,
        CGPA: cumulativeCGPA,
      };
    });
  }, [results]);

  // Grade distribution pie data
  const gradeDistData = useMemo(() => {
    return GRADE_OPTIONS.filter((g) => (gradeDistribution[g.grade] ?? 0) > 0).map((g) => ({
      name: `${g.grade} (${g.label})`,
      value: gradeDistribution[g.grade] ?? 0,
      color: g.color,
    }));
  }, [gradeDistribution]);

  // Project subjects performance
  const projectPerformance = useMemo(() => {
    const projects: Array<{ name: string; code: string; grade: string; semester: string }> = [];
    for (const result of results) {
      const semName = SEMESTERS.find((s) => s.id === result.semesterId)?.name ?? `Semester ${result.semesterId}`;
      for (const g of result.grades) {
        if (g.isProject) {
          projects.push({ name: g.subjectName, code: g.code ?? '', grade: g.grade, semester: semName });
        }
      }
    }
    return projects;
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          title="No Analytics Available"
          description="Enter your semester grades to unlock powerful academic insights and analytics."
          actionLabel="Enter Grades"
          actionPath="/sgpa"
          icon="📊"
        />
      </div>
    );
  }

  const strongestSemName = highest
    ? SEMESTERS.find((s) => s.id === highest.semesterId)?.name ?? `Semester ${highest.semesterId}`
    : '—';
  const weakestSemName = lowest
    ? SEMESTERS.find((s) => s.id === lowest.semesterId)?.name ?? `Semester ${lowest.semesterId}`
    : '—';
  const improvedSemName = mostImproved
    ? SEMESTERS.find((s) => s.id === mostImproved.semesterId)?.name ?? `Semester ${mostImproved.semesterId}`
    : null;

  const metrics = [
    {
      label: 'Current CGPA',
      value: cgpa.toFixed(2),
      icon: <BarChart3 size={22} />,
      color: '#3B82F6',
    },
    {
      label: 'Consistency Score',
      value: `${consistencyScore.toFixed(0)}%`,
      icon: <Target size={22} />,
      color: '#10B981',
    },
    {
      label: 'Credit Completion',
      value: `${totalCredits} / ${TOTAL_PROGRAM_CREDITS}`,
      sub: `${creditCompletion}%`,
      icon: <Layers size={22} />,
      color: '#8B5CF6',
    },
    {
      label: 'Performance Growth',
      value: `${growth > 0 ? '+' : ''}${growth}%`,
      icon: <TrendingUp size={22} />,
      color: growth >= 0 ? '#10B981' : '#EF4444',
    },
    {
      label: 'Strongest Semester',
      value: highest ? highest.sgpa.toFixed(2) : '—',
      sub: strongestSemName,
      icon: <Award size={22} />,
      color: '#D4AF37',
    },
    {
      label: 'Most Frequent Grade',
      value: mostFrequentGrade ? `${mostFrequentGrade[0]} (×${mostFrequentGrade[1]})` : '—',
      icon: <Zap size={22} />,
      color: '#F59E0B',
    },
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={28} style={{ color: 'var(--primary-500)' }} />
          Academic Analytics
        </h1>
        <p className="page-subtitle">
          Comprehensive insights and performance metrics across all 8 semesters
        </p>
      </motion.div>

      {/* Performance Metrics Grid */}
      <motion.div
        className="grid-kpi"
        style={{ marginBottom: '2rem' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {metrics.map((m) => (
          <motion.div key={m.label} className="kpi-card" variants={cardVariants}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${m.color}18`,
                  color: m.color,
                }}
              >
                {m.icon}
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {m.label}
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: m.color, letterSpacing: '-0.025em' }}>
              {m.value}
            </div>
            {'sub' in m && m.sub && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {m.sub}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Semester Comparison & Improvement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}
      >
        {/* Weakest Semester */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Growth Baseline
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>
            {lowest ? lowest.sgpa.toFixed(2) : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {weakestSemName} — room for growth
          </div>
        </div>

        {/* Most Improved */}
        {improvedSemName && mostImproved && (
          <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10B981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🚀</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Most Improved
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>
              +{mostImproved.improvement.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {improvedSemName} — biggest SGPA jump
            </div>
          </div>
        )}

        {/* Credit Progress Bar */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <BookOpen size={20} style={{ color: '#8B5CF6' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Credit Completion
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8B5CF6', marginBottom: '0.5rem' }}>
            {totalCredits} / {TOTAL_PROGRAM_CREDITS} credits ({creditCompletion}%)
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--border-color)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${creditCompletion}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #8B5CF6, #a78bfa)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Charts Row: CGPA Trend + Grade Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}
      >
        {/* CGPA / SGPA Trend */}
        <div className="chart-card">
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            📈 SGPA & CGPA Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cgpaTrendData}>
              <defs>
                <linearGradient id="sgpaGradAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cgpaGradAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="SGPA"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fill="url(#sgpaGradAnalytics)"
                dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
              <Area
                type="monotone"
                dataKey="CGPA"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 3"
                fill="url(#cgpaGradAnalytics)"
                dot={{ fill: '#10B981', r: 3, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution Pie */}
        <div className="chart-card">
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            🎯 Grade Distribution
          </h3>
          {gradeDistData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }: any) => `${(name ?? '').split(' ')[0]} ×${value}`}
                >
                  {gradeDistData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                  }}
                  formatter={(value: any, _name: any, props: any) => [
                    `${value} subject${value !== 1 ? 's' : ''}`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No grade data available
            </div>
          )}
        </div>
      </motion.div>

      {/* Project Performance */}
      {projectPerformance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card"
          style={{ padding: '1.25rem', marginBottom: '2rem' }}
        >
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🔬</span> Project Performance
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {projectPerformance.map((proj, i) => {
              const gradeInfo = GRADE_OPTIONS.find((g) => g.grade === proj.grade);
              return (
                <div
                  key={i}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: gradeInfo ? `${gradeInfo.color}10` : 'var(--bg-secondary)',
                    border: `1.5px solid ${gradeInfo?.color ?? 'var(--border-color)'}40`,
                    minWidth: 200,
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    🔬 {proj.name}
                  </div>
                  {proj.code && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.375rem', fontFamily: 'monospace' }}>
                      {proj.code}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      className="badge"
                      style={{
                        background: gradeInfo ? `${gradeInfo.color}20` : 'var(--border-color)',
                        color: gradeInfo?.color ?? 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    >
                      {proj.grade}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {proj.semester}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          AI-Powered Insights
        </h2>
      </motion.div>

      <motion.div
        className="grid-cards"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            variants={cardVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="glass-card"
            style={{
              padding: '1.25rem',
              borderLeft: `4px solid ${getBorderColor(insight.type)}`,
              background: getBgTint(insight.type),
              cursor: 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
              <span
                style={{
                  fontSize: '1.75rem',
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {insight.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {insight.title}
                  </h3>
                  {insight.value && (
                    <span
                      className="badge"
                      style={{
                        background: `${getBorderColor(insight.type)}20`,
                        color: getBorderColor(insight.type),
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                      }}
                    >
                      {insight.value}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {insight.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
