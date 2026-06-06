import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Target, Layers } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { generateInsights } from '../utils/insights';
import {
  calculateCGPA,
  getTotalCreditsEarned,
  getPerformanceGrowth,
} from '../utils/calculations';
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

export default function Analytics() {
  const { getSemesterResults } = useAcademic();
  const results = getSemesterResults();

  const insights = useMemo(() => generateInsights(results), [results]);
  const cgpa = useMemo(() => calculateCGPA(results), [results]);
  const totalCredits = useMemo(() => getTotalCreditsEarned(results), [results]);
  const growth = useMemo(() => getPerformanceGrowth(results), [results]);

  const consistencyScore = useMemo(() => {
    if (results.length < 2) return 100;
    const sgpas = results.map((r) => r.sgpa);
    const mean = sgpas.reduce((s, v) => s + v, 0) / sgpas.length;
    const variance = sgpas.reduce((s, v) => s + (v - mean) ** 2, 0) / sgpas.length;
    return Math.max(0, 100 - variance * 100);
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

  const metrics = [
    {
      label: 'Average SGPA',
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
      label: 'Total Credits',
      value: totalCredits.toString(),
      icon: <Layers size={22} />,
      color: '#8B5CF6',
    },
    {
      label: 'Growth Rate',
      value: `${growth > 0 ? '+' : ''}${growth}%`,
      icon: <TrendingUp size={22} />,
      color: growth >= 0 ? '#10B981' : '#EF4444',
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
          Comprehensive insights and performance metrics from your academic journey
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
          </motion.div>
        ))}
      </motion.div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
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
