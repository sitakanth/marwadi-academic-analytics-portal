import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { calculateGoalPlan, calculateCGPA } from '../utils/calculations';
import { SEMESTERS } from '../data/semesters';
import { validateTargetCGPA } from '../utils/validation';
import EmptyState from '../components/ui/EmptyState';

function getFeasibilityConfig(feasibility: string) {
  switch (feasibility) {
    case 'achievable':
      return { label: 'Achievable', color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={16} /> };
    case 'challenging':
      return { label: 'Challenging', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: <AlertTriangle size={16} /> };
    case 'extremely-challenging':
      return { label: 'Extremely Challenging', color: '#F97316', bg: 'rgba(249,115,22,0.12)', icon: <AlertTriangle size={16} /> };
    case 'impossible':
      return { label: 'Not Possible', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={16} /> };
    default:
      return { label: feasibility, color: '#6B7280', bg: 'rgba(107,114,128,0.12)', icon: <Target size={16} /> };
  }
}

export default function GoalPlanner() {
  const { getSemesterResults } = useAcademic();
  const results = getSemesterResults();
  const [targetStr, setTargetStr] = useState('9.0');

  const completedSemesterIds = useMemo(() => results.map((r) => r.semesterId), [results]);
  const remainingSemesterIds = useMemo(
    () => SEMESTERS.filter((s) => !completedSemesterIds.includes(s.id)).map((s) => s.id),
    [completedSemesterIds]
  );

  const target = parseFloat(targetStr) || 0;
  const currentCGPA = useMemo(() => calculateCGPA(results), [results]);

  const validation = useMemo(() => validateTargetCGPA(target, currentCGPA), [target, currentCGPA]);
  const alreadyAchieved = target > 0 && target <= currentCGPA;

  const goalPlan = useMemo(() => {
    if (!validation.valid || target <= 0 || results.length === 0) return null;
    return calculateGoalPlan(results, target, remainingSemesterIds);
  }, [results, target, remainingSemesterIds, validation.valid]);

  const progressPercent = useMemo(() => {
    if (target <= 0) return 0;
    return Math.min(100, (currentCGPA / target) * 100);
  }, [currentCGPA, target]);

  if (results.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          title="Goal Planner Unavailable"
          description="Enter your semester grades first to use the CGPA Goal Planner."
          actionLabel="Enter Grades"
          actionPath="/sgpa"
          icon="🎯"
        />
      </div>
    );
  }

  const fConfig = goalPlan ? getFeasibilityConfig(goalPlan.feasibility) : null;

  // Circular gauge SVG params
  const gaugeRadius = 80;
  const gaugeStroke = 10;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeDashOffset = gaugeCircumference - (progressPercent / 100) * gaugeCircumference;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={28} style={{ color: 'var(--primary-500)' }} />
          CGPA Goal Planner
        </h1>
        <p className="page-subtitle">Plan your path to academic excellence with data-driven projections</p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card"
        style={{ padding: '1.5rem', marginBottom: '2rem' }}
      >
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Target CGPA
        </label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            className="input-premium"
            style={{ maxWidth: 200 }}
            value={targetStr}
            min={0}
            max={10}
            step={0.1}
            onChange={(e) => setTargetStr(e.target.value)}
            placeholder="e.g. 9.0"
          />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Range: 0.0 – 10.0 | Completed: {completedSemesterIds.length} semester{completedSemesterIds.length !== 1 ? 's' : ''} | Remaining: {remainingSemesterIds.length}
          </span>
        </div>
        {validation.message && (
          <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', color: alreadyAchieved ? '#10B981' : '#EF4444' }}>
            {validation.message}
          </p>
        )}
      </motion.div>

      {/* Already Achieved */}
      {alreadyAchieved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="glass-card"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.06))',
            border: '1px solid rgba(16,185,129,0.3)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={48} style={{ color: '#10B981', marginBottom: '1rem' }} />
          </motion.div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginBottom: '0.5rem' }}>
            🎉 Congratulations!
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Your current CGPA of <strong style={{ color: 'var(--text-primary)' }}>{currentCGPA.toFixed(2)}</strong> has already surpassed your target of <strong style={{ color: 'var(--text-primary)' }}>{target.toFixed(2)}</strong>!
          </p>
        </motion.div>
      )}

      {/* Goal Plan Results */}
      {goalPlan && !alreadyAchieved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}
        >
          {/* Left: Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Current vs Target */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="kpi-card">
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current CGPA
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-500)', marginTop: '0.375rem' }}>
                  {goalPlan.currentCGPA.toFixed(2)}
                </div>
              </div>
              <div className="kpi-card">
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target CGPA
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gold-500)', marginTop: '0.375rem' }}>
                  {goalPlan.targetCGPA.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Required SGPA */}
            <div className="kpi-card">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Required Average SGPA
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <TrendingUp size={24} style={{ color: fConfig?.color ?? 'var(--text-muted)' }} />
                <span style={{ fontSize: '2rem', fontWeight: 800, color: fConfig?.color ?? 'var(--text-primary)' }}>
                  {goalPlan.requiredSGPA.toFixed(2)}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
                Average SGPA needed across {remainingSemesterIds.length} remaining semester{remainingSemesterIds.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Feasibility */}
            {fConfig && (
              <div className="kpi-card" style={{ borderLeft: `4px solid ${fConfig.color}` }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Feasibility
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.5rem' }}>
                  <span
                    className="badge"
                    style={{
                      background: fConfig.bg,
                      color: fConfig.color,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      padding: '0.375rem 1rem',
                      gap: '0.5rem',
                    }}
                  >
                    {fConfig.icon}
                    {fConfig.label}
                  </span>
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Progress to Target</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-500)' }}>{progressPercent.toFixed(1)}%</span>
              </div>
              <div style={{ width: '100%', height: 10, borderRadius: 'var(--radius-full)', background: 'var(--border-color)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    borderRadius: 'var(--radius-full)',
                    background: `linear-gradient(90deg, var(--primary-600), var(--cyan-500))`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Circular Gauge */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width={200} height={200} viewBox={`0 0 ${(gaugeRadius + gaugeStroke) * 2} ${(gaugeRadius + gaugeStroke) * 2}`}>
              {/* Background circle */}
              <circle
                cx={gaugeRadius + gaugeStroke}
                cy={gaugeRadius + gaugeStroke}
                r={gaugeRadius}
                fill="none"
                stroke="var(--border-color)"
                strokeWidth={gaugeStroke}
              />
              {/* Progress circle */}
              <motion.circle
                cx={gaugeRadius + gaugeStroke}
                cy={gaugeRadius + gaugeStroke}
                r={gaugeRadius}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth={gaugeStroke}
                strokeLinecap="round"
                strokeDasharray={gaugeCircumference}
                initial={{ strokeDashoffset: gaugeCircumference }}
                animate={{ strokeDashoffset: gaugeDashOffset }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '50% 50%',
                }}
              />
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary-500)" />
                  <stop offset="100%" stopColor="var(--cyan-500)" />
                </linearGradient>
              </defs>
              {/* Center text */}
              <text
                x={gaugeRadius + gaugeStroke}
                y={gaugeRadius + gaugeStroke - 8}
                textAnchor="middle"
                style={{ fontSize: '2rem', fontWeight: 800, fill: 'var(--text-primary)' }}
              >
                {progressPercent.toFixed(0)}%
              </text>
              <text
                x={gaugeRadius + gaugeStroke}
                y={gaugeRadius + gaugeStroke + 16}
                textAnchor="middle"
                style={{ fontSize: '0.75rem', fontWeight: 500, fill: 'var(--text-muted)' }}
              >
                toward {target.toFixed(1)} CGPA
              </text>
            </svg>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {goalPlan.currentCredits} credits completed · {goalPlan.remainingCredits} credits remaining
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
