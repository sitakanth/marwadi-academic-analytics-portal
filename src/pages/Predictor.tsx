import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Award,
  TrendingUp,
  Minus,
  FolderKanban,
  ListChecks,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import {
  SEMESTERS,
  getActiveSubjects,
  getActiveCreditSubjects,
  getNonCreditSubjects,
} from '../data/semesters';
import { GRADE_MAP, GRADE_OPTIONS, NON_CREDIT_GRADE } from '../config/gradeSystem';
import { calculateSGPA, calculateCGPA, calculateCGPAFromSGPAs } from '../utils/calculations';
import { getAcademicStanding } from '../config/gradeSystem';
import { useAnimatedCounter } from '../hooks/useLocalStorage';
import type { GradeEntry } from '../types';

/* animation presets */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const row = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Predictor() {
  const { getSemesterResults, getSelectedElectives, dispatch } = useAcademic();
  const results = getSemesterResults();
  const [selectedSem, setSelectedSem] = useState(1);

  /* local elective selections for prediction (mirrors context shape) */
  const [localElectives, setLocalElectives] = useState<Record<number, Record<string, string>>>(() => {
    const init: Record<number, Record<string, string>> = {};
    for (const sem of SEMESTERS) {
      if (sem.electiveGroups) {
        init[sem.id] = { ...getSelectedElectives(sem.id) };
      }
    }
    return init;
  });

  const semester = SEMESTERS.find((s) => s.id === selectedSem)!;
  const electivesForSem = localElectives[selectedSem] ?? {};

  const activeSubjects = useMemo(
    () => getActiveSubjects(semester, electivesForSem),
    [semester, electivesForSem],
  );
  const creditSubjects = useMemo(
    () => getActiveCreditSubjects(semester, electivesForSem),
    [semester, electivesForSem],
  );
  const nonCreditSubjects = useMemo(() => getNonCreditSubjects(semester), [semester]);

  /* grade state for the prediction — keyed by subject code */
  const [grades, setGrades] = useState<GradeEntry[]>(() =>
    buildGradeEntries(activeSubjects),
  );

  function buildGradeEntries(subjects: ReturnType<typeof getActiveSubjects>): GradeEntry[] {
    return subjects.map((sub) => ({
      subjectName: sub.name,
      code: sub.code,
      credits: sub.credits,
      isNonCredit: sub.isNonCredit,
      isProject: sub.isProject,
      electiveGroupId: sub.electiveGroupId,
      grade: sub.isNonCredit ? NON_CREDIT_GRADE : '',
    }));
  }

  const handleSemChange = (id: number) => {
    setSelectedSem(id);
    const sem = SEMESTERS.find((s) => s.id === id)!;
    const elecs = localElectives[id] ?? {};
    const subjects = getActiveSubjects(sem, elecs);
    setGrades(buildGradeEntries(subjects));
  };

  /* When elective selection changes, rebuild grades for the affected semester */
  const handleElectiveChange = (groupId: string, subjectCode: string) => {
    const updated = {
      ...localElectives,
      [selectedSem]: {
        ...(localElectives[selectedSem] ?? {}),
        [groupId]: subjectCode,
      },
    };
    setLocalElectives(updated);

    // Also persist to context
    dispatch({
      type: 'SET_ELECTIVE_SELECTION',
      payload: { semesterId: selectedSem, groupId, subjectCode },
    });

    // Rebuild grade entries with new elective
    const sem = SEMESTERS.find((s) => s.id === selectedSem)!;
    const newSubjects = getActiveSubjects(sem, updated[selectedSem] ?? {});
    setGrades((prev) => {
      // Keep existing grades for subjects that remain
      const prevMap = new Map(prev.map((g) => [g.code, g]));
      return newSubjects.map((sub) => {
        const existing = prevMap.get(sub.code);
        if (existing) return existing;
        return {
          subjectName: sub.name,
          code: sub.code,
          credits: sub.credits,
          isNonCredit: sub.isNonCredit,
          isProject: sub.isProject,
          electiveGroupId: sub.electiveGroupId,
          grade: sub.isNonCredit ? NON_CREDIT_GRADE : '',
        };
      });
    });
  };

  const updateGrade = (code: string, grade: string) => {
    setGrades((prev) =>
      prev.map((g) => (g.code === code ? { ...g, grade } : g)),
    );
  };

  /* computed values */
  const expectedSGPA = useMemo(() => calculateSGPA(grades), [grades]);
  const currentCGPA = useMemo(() => calculateCGPA(results), [results]);
  const currentStanding = useMemo(() => getAcademicStanding(currentCGPA), [currentCGPA]);

  // Expected CGPA: combine existing results + this prediction
  const expectedCGPA = useMemo(() => {
    if (expectedSGPA <= 0) return currentCGPA;
    const existingSgpas = results
      .filter((r) => r.semesterId !== selectedSem)
      .map((r) => ({ semesterId: r.semesterId, sgpa: r.sgpa }));
    existingSgpas.push({ semesterId: selectedSem, sgpa: expectedSGPA });
    return calculateCGPAFromSGPAs(existingSgpas);
  }, [results, expectedSGPA, selectedSem, currentCGPA]);

  const expectedStanding = useMemo(() => getAcademicStanding(expectedCGPA), [expectedCGPA]);
  const cgpaDiff = expectedCGPA - currentCGPA;
  const isImprovement = cgpaDiff > 0;
  const isDecline = cgpaDiff < 0;
  const isNeutral = Math.abs(cgpaDiff) < 0.005;

  const animExpSGPA = useAnimatedCounter(expectedSGPA, 800, 2);
  const animExpCGPA = useAnimatedCounter(expectedCGPA, 800, 2);
  const animCurrCGPA = useAnimatedCounter(currentCGPA, 800, 2);

  const hasGrades = creditSubjects.some((sub) => {
    const g = grades.find((gr) => gr.code === sub.code);
    return g && g.grade && g.grade !== '';
  });

  const hasElectives = !!(semester.electiveGroups && semester.electiveGroups.length > 0);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Expected Result Predictor</h1>
        <p className="page-subtitle">Predict how future grades will impact your CGPA</p>
      </motion.div>

      {/* ═══ Semester Tabs ═══ */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {SEMESTERS.map((sem) => {
          const isActive = sem.id === selectedSem;
          return (
            <motion.button
              key={sem.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSemChange(sem.id)}
              className={isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
            >
              Sem {sem.id}
            </motion.button>
          );
        })}
      </div>

      {/* ═══ Elective Selector (semesters 5, 6, 7) ═══ */}
      {hasElectives && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '1.25rem', marginBottom: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ListChecks size={16} style={{ color: 'var(--primary-400)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Elective Selection
            </span>
          </div>
          {semester.electiveGroups!.map((group) => (
            <div key={group.id} style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.375rem',
                }}
              >
                {group.title}
              </label>
              <select
                className="select-premium"
                value={electivesForSem[group.id] ?? ''}
                onChange={(e) => handleElectiveChange(group.id, e.target.value)}
                style={{ maxWidth: 400 }}
              >
                <option value="">— Select Elective —</option>
                {group.options.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name} ({opt.credits} cr)
                  </option>
                ))}
              </select>
            </div>
          ))}
        </motion.div>
      )}

      {/* ═══ Comparison Cards (top) ═══ */}
      {results.length > 0 && hasGrades && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem',
            marginBottom: '2rem',
            alignItems: 'center',
          }}
        >
          {/* current CGPA */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              borderTop: '3px solid var(--primary-500)',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}
            >
              Current CGPA
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              {animCurrCGPA}
            </div>
            <span
              className="badge"
              style={{
                marginTop: '0.5rem',
                background: `${currentStanding.color}22`,
                color: currentStanding.color,
                fontSize: '0.65rem',
              }}
            >
              {currentStanding.icon} {currentStanding.label}
            </span>
          </div>

          {/* diff arrow */}
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isNeutral
                  ? 'rgba(100,116,139,0.15)'
                  : isImprovement
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(239,68,68,0.15)',
              }}
            >
              {isNeutral ? (
                <Minus size={22} style={{ color: '#64748b' }} />
              ) : isImprovement ? (
                <ArrowUpRight size={22} style={{ color: '#10b981' }} />
              ) : (
                <ArrowDownRight size={22} style={{ color: '#ef4444' }} />
              )}
            </motion.div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                marginTop: '0.35rem',
                color: isNeutral
                  ? '#64748b'
                  : isImprovement
                    ? '#10b981'
                    : '#ef4444',
              }}
            >
              {isNeutral
                ? 'No change'
                : `${isImprovement ? '+' : ''}${cgpaDiff.toFixed(2)}`}
            </div>
          </div>

          {/* expected CGPA */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              borderTop: `3px solid ${isImprovement ? '#10b981' : isDecline ? '#ef4444' : 'var(--primary-500)'}`,
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}
            >
              Expected CGPA
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: isImprovement ? '#10b981' : isDecline ? '#ef4444' : 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              {animExpCGPA}
            </div>
            <span
              className="badge"
              style={{
                marginTop: '0.5rem',
                background: `${expectedStanding.color}22`,
                color: expectedStanding.color,
                fontSize: '0.65rem',
              }}
            >
              {expectedStanding.icon} {expectedStanding.label}
            </span>
          </div>
        </motion.div>
      )}

      {/* performance projection text */}
      {hasGrades && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card"
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            borderLeft: `3px solid ${isImprovement ? '#10b981' : isDecline ? '#ef4444' : '#64748b'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <TrendingUp size={18} style={{ color: isImprovement ? '#10b981' : isDecline ? '#ef4444' : '#64748b', flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {isNeutral
              ? 'Your predicted grades would maintain your current CGPA. Consider aiming higher for improvement.'
              : isImprovement
                ? `Great outlook! With these predicted grades, your CGPA would improve by ${cgpaDiff.toFixed(2)} points to ${expectedCGPA.toFixed(2)}. Keep pushing for excellence!`
                : `Heads up — these grades would lower your CGPA by ${Math.abs(cgpaDiff).toFixed(2)} points to ${expectedCGPA.toFixed(2)}. Focus on strengthening weaker subjects.`}
          </p>
        </motion.div>
      )}

      {/* ═══ Main Layout ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        {/* left — subject grades */}
        <div>
          {/* credit subjects */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BookOpen size={16} style={{ color: 'var(--primary-400)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {semester.name} — Credit Subjects
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
              {creditSubjects.length}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedSem}-${Object.values(electivesForSem).join(',')}`}
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              {creditSubjects.map((sub) => {
                const g = grades.find((gr) => gr.code === sub.code);
                const gradeVal = g?.grade ?? '';
                const points = gradeVal ? sub.credits * (GRADE_MAP[gradeVal] ?? 0) : 0;
                const gradeInfo = GRADE_OPTIONS.find((o) => o.grade === gradeVal);
                return (
                  <motion.div
                    key={sub.code}
                    variants={row}
                    className="glass-card"
                    style={{
                      padding: '0.85rem 1rem',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {sub.name}
                        {sub.isProject && (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.55rem',
                              background: 'rgba(139,92,246,0.15)',
                              color: '#8b5cf6',
                              padding: '0.15rem 0.4rem',
                            }}
                          >
                            <FolderKanban size={10} style={{ marginRight: '0.2rem' }} />
                            Project
                          </span>
                        )}
                        {sub.electiveGroupId && (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.55rem',
                              background: 'rgba(6,182,212,0.12)',
                              color: '#06b6d4',
                              padding: '0.15rem 0.4rem',
                            }}
                          >
                            Elective
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {sub.code}
                      </div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>
                      {sub.credits} cr
                    </span>
                    <select
                      className="select-premium"
                      value={gradeVal}
                      onChange={(e) => updateGrade(sub.code, e.target.value)}
                      style={{ width: 130 }}
                    >
                      <option value="">Select Grade</option>
                      {GRADE_OPTIONS.map((opt) => (
                        <option key={opt.grade} value={opt.grade}>
                          {opt.grade} — {opt.label} ({opt.points})
                        </option>
                      ))}
                    </select>
                    <div
                      style={{
                        width: 55,
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: gradeInfo?.color ?? 'var(--text-muted)',
                      }}
                    >
                      {gradeVal ? points : '—'}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* non-credit */}
          {nonCreditSubjects.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Award size={16} style={{ color: 'var(--gold-500)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Non-Credit Subjects
                </span>
              </div>
              {nonCreditSubjects.map((sub) => (
                <div
                  key={sub.code}
                  className="glass-card"
                  style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    opacity: 0.75,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {sub.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {sub.code}
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>
                    S (Pass)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Expected SGPA card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          style={{ position: 'sticky', top: 'calc(var(--topbar-height) + 1.5rem)' }}
        >
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              textAlign: 'center',
              borderTop: '3px solid #8b5cf6',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <Target size={18} style={{ color: '#8b5cf6' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Prediction
              </span>
            </div>

            <div
              style={{
                fontSize: '3rem',
                fontWeight: 900,
                background:
                  expectedSGPA > 0
                    ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                    : 'var(--text-muted)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
                marginBottom: '0.25rem',
              }}
            >
              {expectedSGPA > 0 ? animExpSGPA : '—'}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1.25rem',
              }}
            >
              Expected SGPA
            </div>

            {/* Semester credits info */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                Semester Credits
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {semester.totalCredits}
              </div>
            </div>

            {/* expected CGPA if data exists */}
            {results.length > 0 && hasGrades && (
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.35rem',
                  }}
                >
                  Projected CGPA
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: isImprovement ? '#10b981' : isDecline ? '#ef4444' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {isImprovement && <ArrowUpRight size={18} />}
                  {isDecline && <ArrowDownRight size={18} />}
                  {expectedCGPA.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* responsive override */}
      <style>{`
        @media (max-width: 768px) {
          .page-container > div:nth-of-type(3) {
            grid-template-columns: 1fr !important;
          }
          .page-container > div:nth-of-type(1) {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .page-container > div[style*="grid-template-columns: 1fr auto 1fr"] {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
