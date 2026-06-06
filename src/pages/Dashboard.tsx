import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Award,
  GraduationCap,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
} from 'recharts';
import { useAcademic } from '../context/AcademicContext';
import { useAnimatedCounter } from '../hooks/useLocalStorage';
import {
  calculateCGPA,
  getHighestSGPA,
  getTotalCreditsEarned,
  getPerformanceGrowth,
  getGradeDistribution,
} from '../utils/calculations';
import { getAcademicStanding, cgpaToPercentage, GRADE_OPTIONS } from '../config/gradeSystem';
import { SEMESTERS, getTotalProgramCredits } from '../data/semesters';
import { generateInsights } from '../utils/insights';
import { evaluateAchievements } from '../utils/achievements';
import EmptyState from '../components/ui/EmptyState';

/* animation presets */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const CHART_COLORS = ['#2563eb', '#10b981', '#d4af37', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'];

/* custom tooltip */
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

/* ══════════════ COMPONENT ══════════════ */
export default function Dashboard() {
  const { getSemesterResults } = useAcademic();
  const results = getSemesterResults();
  const hasData = results.length > 0;

  /* computed data */
  const cgpa = useMemo(() => calculateCGPA(results), [results]);
  const latestSgpa = useMemo(
    () => (results.length > 0 ? results[results.length - 1].sgpa : 0),
    [results],
  );
  const highest = useMemo(() => getHighestSGPA(results), [results]);
  const creditsEarned = useMemo(() => getTotalCreditsEarned(results), [results]);
  const growth = useMemo(() => getPerformanceGrowth(results), [results]);
  const standing = useMemo(() => getAcademicStanding(cgpa), [cgpa]);
  const totalProgCredits = getTotalProgramCredits();
  const gradeDist = useMemo(() => getGradeDistribution(results), [results]);
  const insights = useMemo(() => generateInsights(results), [results]);
  const achievements = useMemo(() => evaluateAchievements(results), [results]);

  /* animated counters */
  const animCGPA = useAnimatedCounter(cgpa, 1500, 2);
  const animSGPA = useAnimatedCounter(latestSgpa, 1500, 2);
  const animCredits = useAnimatedCounter(creditsEarned, 1200, 0);
  const animGrowth = useAnimatedCounter(growth, 1200, 1);
  const animHighest = useAnimatedCounter(highest?.sgpa ?? 0, 1200, 2);

  /* chart data */
  const sgpaTrendData = useMemo(
    () =>
      results.map((r) => ({
        name: SEMESTERS.find((s) => s.id === r.semesterId)?.name ?? `Sem ${r.semesterId}`,
        SGPA: r.sgpa,
      })),
    [results],
  );

  const creditDistData = useMemo(
    () =>
      results.map((r, i) => ({
        name: `Sem ${r.semesterId}`,
        value: SEMESTERS.find((s) => s.id === r.semesterId)?.totalCredits ?? 0,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [results],
  );

  const gradeDistData = useMemo(() => {
    const order = GRADE_OPTIONS.map((g) => g.grade);
    return order
      .filter((g) => gradeDist[g] !== undefined)
      .map((g) => ({
        grade: g,
        count: gradeDist[g],
        fill: GRADE_OPTIONS.find((o) => o.grade === g)?.color ?? '#64748b',
      }));
  }, [gradeDist]);

  const radarData = useMemo(() => {
    if (!hasData) return [];
    const sgpas = results.map((r) => r.sgpa);
    const avg = sgpas.reduce((s, v) => s + v, 0) / sgpas.length;
    const variance = sgpas.reduce((s, v) => s + (v - avg) ** 2, 0) / sgpas.length;
    const consistency = Math.max(0, 10 - variance * 10);
    return [
      { metric: 'Average', value: avg, fullMark: 10 },
      { metric: 'Highest', value: highest?.sgpa ?? 0, fullMark: 10 },
      { metric: 'Consistency', value: consistency, fullMark: 10 },
      { metric: 'Growth', value: Math.min(10, Math.max(0, 5 + growth / 10)), fullMark: 10 },
      { metric: 'Credits', value: (creditsEarned / totalProgCredits) * 10, fullMark: 10 },
    ];
  }, [results, highest, growth, creditsEarned, totalProgCredits, hasData]);

  /* CGPA gauge SVG */
  const gaugeRadius = 44;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeProgress = cgpa / 10;

  /* timeline data */
  const timelineEvents = useMemo(() => {
    const sorted = [...results].sort((a, b) => a.semesterId - b.semesterId);
    return sorted.map((r, i) => {
      const sem = SEMESTERS.find((s) => s.id === r.semesterId);
      const prevSgpa = i > 0 ? sorted[i - 1].sgpa : null;
      const growthPct = prevSgpa && prevSgpa > 0 ? ((r.sgpa - prevSgpa) / prevSgpa) * 100 : null;
      const unlocked = achievements.filter((a) => a.unlocked);
      return {
        label: sem?.name ?? `Semester ${r.semesterId}`,
        sgpa: r.sgpa,
        growth: growthPct !== null ? Math.round(growthPct * 10) / 10 : null,
        achievement: i === sorted.length - 1 && unlocked.length > 0 ? unlocked[0].title : undefined,
      };
    });
  }, [results, achievements]);

  /* ─── empty state ─── */
  if (!hasData) {
    return (
      <div className="page-container">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your executive academic overview</p>
        <EmptyState
          title="Start Your Academic Journey"
          description="Enter your grades to unlock analytics and performance insights."
          actionLabel="Go to SGPA Calculator"
          actionPath="/sgpa"
        />
      </div>
    );
  }

  /* ─── main render ─── */
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Executive academic performance overview</p>
      </motion.div>

      {/* ═══ KPI CARDS ═══ */}
      <motion.div className="grid-kpi" variants={container} initial="hidden" animate="show">
        {/* 1 — CGPA with gauge */}
        <motion.div variants={item} className="kpi-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <svg width={100} height={100} viewBox="0 0 100 100">
            <circle
              cx={50}
              cy={50}
              r={gaugeRadius}
              fill="none"
              stroke="var(--border-color)"
              strokeWidth={7}
            />
            <motion.circle
              cx={50}
              cy={50}
              r={gaugeRadius}
              fill="none"
              stroke="url(#cgpaGradient)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={gaugeCircumference}
              initial={{ strokeDashoffset: gaugeCircumference }}
              animate={{ strokeDashoffset: gaugeCircumference * (1 - gaugeProgress) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="cgpaGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <text x={50} y={46} textAnchor="middle" style={{ fontSize: '1.3rem', fontWeight: 800, fill: 'var(--text-primary)' }}>
              {animCGPA}
            </text>
            <text x={50} y={62} textAnchor="middle" style={{ fontSize: '0.55rem', fill: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
              CGPA
            </text>
          </svg>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>
              Current CGPA
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {cgpaToPercentage(cgpa)}% Equivalent
            </div>
          </div>
        </motion.div>

        {/* 2 — Latest SGPA */}
        <motion.div variants={item} className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Latest SGPA
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{animSGPA}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {SEMESTERS.find((s) => s.id === results[results.length - 1].semesterId)?.name}
          </div>
        </motion.div>

        {/* 3 — Academic Standing */}
        <motion.div variants={item} className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `linear-gradient(135deg, ${standing.color}, ${standing.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Standing
            </span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: standing.color, marginBottom: '0.25rem' }}>
            {standing.icon} {standing.label}
          </div>
          <span className="badge" style={{ background: `${standing.color}22`, color: standing.color, fontSize: '0.65rem' }}>
            Based on CGPA {cgpa.toFixed(2)}
          </span>
        </motion.div>

        {/* 4 — Credits */}
        <motion.div variants={item} className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #06b6d4, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Credits Earned
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {animCredits}
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {totalProgCredits}</span>
          </div>
          {/* progress bar */}
          <div style={{ height: 6, borderRadius: 999, background: 'var(--border-color)', marginTop: '0.5rem', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(creditsEarned / totalProgCredits) * 100}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #06b6d4, #22d3ee)' }}
            />
          </div>
        </motion.div>

        {/* 5 — Highest SGPA */}
        <motion.div variants={item} className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #d4af37, #e5c158)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Highest SGPA
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d4af37' }}>{animHighest}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {highest ? SEMESTERS.find((s) => s.id === highest.semesterId)?.name : '—'}
          </div>
        </motion.div>

        {/* 6 — Performance Growth */}
        <motion.div variants={item} className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: growth >= 0 ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {growth >= 0 ? <TrendingUp size={18} color="#fff" /> : <TrendingDown size={18} color="#fff" />}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Growth
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: growth >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {growth >= 0 ? <ArrowUpRight size={22} /> : <TrendingDown size={22} />}
            {animGrowth}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Since first semester</div>
        </motion.div>
      </motion.div>

      {/* ═══ CHARTS ═══ */}
      <motion.div
        className="grid-charts"
        variants={container}
        initial="hidden"
        animate="show"
        style={{ marginTop: '2rem' }}
      >
        {/* 1 — SGPA Trend */}
        <motion.div variants={item} className="chart-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            📈 SGPA Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={sgpaTrendData}>
              <defs>
                <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="SGPA" stroke="#2563eb" strokeWidth={3} fill="url(#sgpaGrad)" dot={{ fill: '#2563eb', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 2 — Credit Distribution Donut */}
        <motion.div variants={item} className="chart-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🎯 Credit Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={creditDistData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {creditDistData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 3 — Grade Distribution */}
        <motion.div variants={item} className="chart-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            📊 Grade Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={gradeDistData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Count">
                {gradeDistData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 4 — Performance Radar */}
        <motion.div variants={item} className="chart-card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🕸️ Performance Radar
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-color)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar name="Performance" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* ═══ ACADEMIC TIMELINE ═══ */}
      {timelineEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginTop: '2.5rem' }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={20} /> Academic Timeline
          </h3>
          <div style={{ position: 'relative', paddingLeft: 42 }}>
            <div className="timeline-line" />
            <motion.div variants={container} initial="hidden" animate="show">
              {timelineEvents.map((ev, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  style={{
                    position: 'relative',
                    paddingBottom: i < timelineEvents.length - 1 ? '2rem' : 0,
                    paddingLeft: '1.5rem',
                  }}
                >
                  <div className="timeline-dot" style={{ position: 'absolute', left: -6, top: 4 }} />
                  <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {ev.label}
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        SGPA: {ev.sgpa.toFixed(2)}
                      </span>
                      {ev.growth !== null && (
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.65rem',
                            background: ev.growth >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: ev.growth >= 0 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {ev.growth >= 0 ? '↑' : '↓'} {Math.abs(ev.growth)}%
                        </span>
                      )}
                      {ev.achievement && (
                        <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                          🏆 {ev.achievement}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ═══ INSIGHTS PREVIEW ═══ */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ marginTop: '2.5rem' }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={20} /> Insights
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {insights.slice(0, 3).map((insight) => {
              const typeColors: Record<string, string> = {
                positive: '#10b981',
                warning: '#f59e0b',
                info: '#3b82f6',
                neutral: '#64748b',
              };
              const col = typeColors[insight.type] ?? '#64748b';
              return (
                <motion.div
                  key={insight.id}
                  whileHover={{ y: -3 }}
                  className="glass-card"
                  style={{ padding: '1.25rem', borderLeft: `3px solid ${col}` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{insight.icon}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {insight.title}
                    </span>
                    {insight.value && (
                      <span className="badge" style={{ marginLeft: 'auto', background: `${col}22`, color: col, fontSize: '0.65rem' }}>
                        {insight.value}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {insight.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
