import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  BookOpen,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { SEMESTERS } from '../data/semesters';
import { calculateCGPAFromSGPAs } from '../utils/calculations';
import { getAcademicStanding, cgpaToPercentage } from '../config/gradeSystem';
import { useAnimatedCounter } from '../hooks/useLocalStorage';
import EmptyState from '../components/ui/EmptyState';

/* animation presets */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function CGPACalculator() {
  const { getSemesterResults, getResultForSemester } = useAcademic();
  const results = getSemesterResults();

  /* per-semester SGPA state: pre-fill from context, allow manual override */
  const [sgpas, setSgpas] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    SEMESTERS.forEach((sem) => {
      const r = getResultForSemester(sem.id);
      init[sem.id] = r ? r.sgpa.toFixed(2) : '';
    });
    return init;
  });

  const updateSGPA = (semId: number, val: string) => {
    // allow only valid numeric input 0-10
    if (val === '' || /^\d{0,2}(\.\d{0,2})?$/.test(val)) {
      const num = parseFloat(val);
      if (val !== '' && (num < 0 || num > 10)) return;
      setSgpas((prev) => ({ ...prev, [semId]: val }));
    }
  };

  /* computed */
  const validEntries = useMemo(
    () =>
      SEMESTERS.filter((sem) => {
        const v = parseFloat(sgpas[sem.id]);
        return !isNaN(v) && v > 0;
      }).map((sem) => ({
        semesterId: sem.id,
        sgpa: parseFloat(sgpas[sem.id]),
      })),
    [sgpas],
  );

  const cgpa = useMemo(() => calculateCGPAFromSGPAs(validEntries), [validEntries]);
  const standing = useMemo(() => getAcademicStanding(cgpa), [cgpa]);
  const percentage = useMemo(() => cgpaToPercentage(cgpa), [cgpa]);
  const animCGPA = useAnimatedCounter(cgpa, 1200, 2);

  /* SVG gauge */
  const gaugeR = 72;
  const gaugeC = 2 * Math.PI * gaugeR;
  const gaugeProgress = cgpa / 10;

  const hasAnyInput = validEntries.length > 0;

  if (results.length === 0 && !hasAnyInput) {
    // show empty state if nothing at all
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">CGPA Calculator</h1>
        <p className="page-subtitle">Compute your Cumulative Grade Point Average across all semesters</p>
      </motion.div>

      {!hasAnyInput && results.length === 0 ? (
        <EmptyState
          title="No Semester Data Yet"
          description="Calculate your SGPA for at least one semester or enter SGPA values manually below."
          actionLabel="Go to SGPA Calculator"
          actionPath="/sgpa"
        />
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT — semester inputs */}
        <motion.div variants={container} initial="hidden" animate="show">
          {SEMESTERS.map((sem) => {
            const existing = getResultForSemester(sem.id);
            const val = sgpas[sem.id];
            const numVal = parseFloat(val);
            const isValid = !isNaN(numVal) && numVal > 0 && numVal <= 10;
            return (
              <motion.div
                key={sem.id}
                variants={item}
                className="glass-card"
                style={{
                  padding: '1rem 1.25rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  borderLeft: isValid
                    ? '3px solid #10b981'
                    : '3px solid var(--border-color)',
                }}
              >
                {/* semester info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <BookOpen size={15} style={{ color: 'var(--primary-400)' }} />
                    {sem.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.15rem',
                    }}
                  >
                    {sem.totalCredits} Credits &middot; {sem.subjects.length} Subjects
                  </div>
                </div>

                {/* credits badge */}
                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                  {sem.totalCredits} cr
                </span>

                {/* SGPA input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    className="input-premium"
                    type="text"
                    inputMode="decimal"
                    placeholder="SGPA"
                    value={val}
                    onChange={(e) => updateSGPA(sem.id, e.target.value)}
                    style={{
                      width: 100,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}
                  />
                  {existing && (
                    <span
                      className="badge badge-success"
                      style={{ fontSize: '0.6rem' }}
                      title="Auto-filled from saved SGPA"
                    >
                      saved
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* RIGHT — CGPA display (sticky) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ position: 'sticky', top: 'calc(var(--topbar-height) + 1.5rem)' }}
        >
          {/* main CGPA card */}
          <div
            className="glass-card"
            style={{
              padding: '2rem 1.75rem',
              textAlign: 'center',
              borderTop: '3px solid var(--primary-500)',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <Calculator size={18} style={{ color: 'var(--primary-400)' }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                }}
              >
                Cumulative GPA
              </span>
            </div>

            {/* circular gauge */}
            <svg
              width={170}
              height={170}
              viewBox="0 0 170 170"
              style={{ margin: '0 auto', display: 'block' }}
            >
              <circle
                cx={85}
                cy={85}
                r={gaugeR}
                fill="none"
                stroke="var(--border-color)"
                strokeWidth={10}
              />
              <motion.circle
                cx={85}
                cy={85}
                r={gaugeR}
                fill="none"
                stroke="url(#cgpaGaugeGrad)"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={gaugeC}
                initial={{ strokeDashoffset: gaugeC }}
                animate={{
                  strokeDashoffset: hasAnyInput ? gaugeC * (1 - gaugeProgress) : gaugeC,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                transform="rotate(-90 85 85)"
              />
              <defs>
                <linearGradient id="cgpaGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <text
                x={85}
                y={78}
                textAnchor="middle"
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  fill: 'var(--text-primary)',
                }}
              >
                {hasAnyInput ? animCGPA : '—'}
              </text>
              <text
                x={85}
                y={100}
                textAnchor="middle"
                style={{
                  fontSize: '0.65rem',
                  fill: 'var(--text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.1em',
                }}
              >
                CGPA
              </text>
            </svg>

            {/* percentage & standing */}
            {hasAnyInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '1.25rem' }}
              >
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {percentage}% Equivalent
                </div>
                <span
                  className="badge"
                  style={{
                    background: `${standing.color}22`,
                    color: standing.color,
                    fontSize: '0.75rem',
                    padding: '0.35rem 0.85rem',
                  }}
                >
                  {standing.icon} {standing.label}
                </span>
              </motion.div>
            )}
          </div>

          {/* summary card */}
          {hasAnyInput && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card"
              style={{ padding: '1.25rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <BarChart3 size={16} style={{ color: 'var(--primary-400)' }} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  Semester Summary
                </span>
              </div>
              {validEntries.map((entry) => {
                const sem = SEMESTERS.find((s) => s.id === entry.semesterId);
                return (
                  <div
                    key={entry.semesterId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {sem?.name}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {entry.sgpa.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0 0',
                  marginTop: '0.25rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <TrendingUp size={14} style={{ color: '#10b981' }} />
                  Final CGPA
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {cgpa.toFixed(2)}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .page-container > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
