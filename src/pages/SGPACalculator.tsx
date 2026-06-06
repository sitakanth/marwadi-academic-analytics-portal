import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Calculator,
  Award,
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { SEMESTERS, getCreditSubjects, getNonCreditSubjects } from '../data/semesters';
import { GRADE_MAP, GRADE_OPTIONS, NON_CREDIT_GRADE } from '../config/gradeSystem';
import { calculateSGPA } from '../utils/calculations';
import { useAnimatedCounter } from '../hooks/useLocalStorage';
import type { GradeEntry, SemesterResult } from '../types';

/* animation variants */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const row = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

export default function SGPACalculator() {
  const { dispatch, getResultForSemester } = useAcademic();
  const [selectedSem, setSelectedSem] = useState(1);
  const [saved, setSaved] = useState(false);

  const semester = SEMESTERS.find((s) => s.id === selectedSem)!;
  const creditSubjects = getCreditSubjects(semester);
  const nonCreditSubjects = getNonCreditSubjects(semester);

  /* initialise grades from context or blank */
  const existing = getResultForSemester(selectedSem);
  const initialGrades = useCallback(
    () =>
      semester.subjects.map((sub) => {
        const saved = existing?.grades.find((g) => g.subjectName === sub.name);
        return {
          subjectName: sub.name,
          credits: sub.credits,
          isNonCredit: sub.isNonCredit,
          grade: saved?.grade ?? (sub.isNonCredit ? NON_CREDIT_GRADE : ''),
        } as GradeEntry;
      }),
    [semester, existing],
  );

  const [grades, setGrades] = useState<GradeEntry[]>(initialGrades);

  /* re-initialise when semester changes */
  const handleSemChange = (id: number) => {
    setSelectedSem(id);
    setSaved(false);
    const sem = SEMESTERS.find((s) => s.id === id)!;
    const ex = getResultForSemester(id) as SemesterResult | undefined;
    setGrades(
      sem.subjects.map((sub) => {
        const s = ex?.grades.find((g) => g.subjectName === sub.name);
        return {
          subjectName: sub.name,
          credits: sub.credits,
          isNonCredit: sub.isNonCredit,
          grade: s?.grade ?? (sub.isNonCredit ? NON_CREDIT_GRADE : ''),
        };
      }),
    );
  };

  /* computed */
  const sgpa = useMemo(() => calculateSGPA(grades), [grades]);
  const animSGPA = useAnimatedCounter(sgpa, 800, 2);

  const totalCredits = useMemo(
    () =>
      grades
        .filter((g) => !g.isNonCredit && g.grade && g.grade !== NON_CREDIT_GRADE)
        .reduce((s, g) => s + g.credits, 0),
    [grades],
  );
  const totalGradePoints = useMemo(
    () =>
      grades
        .filter((g) => !g.isNonCredit && g.grade && g.grade !== NON_CREDIT_GRADE)
        .reduce((s, g) => s + g.credits * (GRADE_MAP[g.grade] ?? 0), 0),
    [grades],
  );

  const allFilled = creditSubjects.every((sub) => {
    const g = grades.find((gr) => gr.subjectName === sub.name);
    return g && g.grade && g.grade !== '';
  });

  /* handlers */
  const updateGrade = (subjectName: string, grade: string) => {
    setSaved(false);
    setGrades((prev) =>
      prev.map((g) => (g.subjectName === subjectName ? { ...g, grade } : g)),
    );
  };

  const handleSave = () => {
    if (!allFilled) return;
    const result: SemesterResult = {
      semesterId: selectedSem,
      grades,
      sgpa,
      totalCredits: semester.totalCredits,
      totalGradePoints,
    };
    dispatch({ type: 'SET_SEMESTER_RESULT', payload: result });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setSaved(false);
    setGrades(
      semester.subjects.map((sub) => ({
        subjectName: sub.name,
        credits: sub.credits,
        isNonCredit: sub.isNonCredit,
        grade: sub.isNonCredit ? NON_CREDIT_GRADE : '',
      })),
    );
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">SGPA Calculator</h1>
        <p className="page-subtitle">Calculate your Semester Grade Point Average</p>
      </motion.div>

      {/* ═══ Semester Tabs ═══ */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {SEMESTERS.map((sem) => {
          const isActive = sem.id === selectedSem;
          const hasResult = !!getResultForSemester(sem.id);
          return (
            <motion.button
              key={sem.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSemChange(sem.id)}
              className={isActive ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                position: 'relative',
                padding: '0.5rem 1.25rem',
                fontSize: '0.8rem',
              }}
            >
              Sem {sem.id}
              {hasResult && (
                <CheckCircle2
                  size={12}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    color: '#10b981',
                    background: 'var(--bg-card)',
                    borderRadius: '50%',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ═══ Main Layout ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* left — subjects */}
        <div>
          {/* credit subjects */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BookOpen size={16} style={{ color: 'var(--primary-400)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Credit Subjects
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                {creditSubjects.length} subjects
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSem}
                variants={container}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
              >
                {creditSubjects.map((sub) => {
                  const g = grades.find((gr) => gr.subjectName === sub.name);
                  const gradeVal = g?.grade ?? '';
                  const points = gradeVal ? sub.credits * (GRADE_MAP[gradeVal] ?? 0) : 0;
                  const gradeInfo = GRADE_OPTIONS.find((o) => o.grade === gradeVal);
                  return (
                    <motion.div
                      key={sub.name}
                      variants={row}
                      className="glass-card"
                      style={{
                        padding: '0.9rem 1.1rem',
                        marginBottom: '0.625rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* subject name */}
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {sub.name}
                        </div>
                      </div>
                      {/* credits badge */}
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                        {sub.credits} cr
                      </span>
                      {/* grade dropdown */}
                      <select
                        className="select-premium"
                        value={gradeVal}
                        onChange={(e) => updateGrade(sub.name, e.target.value)}
                        style={{ width: 130 }}
                      >
                        <option value="">Select Grade</option>
                        {GRADE_OPTIONS.map((opt) => (
                          <option key={opt.grade} value={opt.grade}>
                            {opt.grade} — {opt.label} ({opt.points})
                          </option>
                        ))}
                      </select>
                      {/* grade points earned */}
                      <div
                        style={{
                          width: 60,
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
          </div>

          {/* non-credit subjects */}
          {nonCreditSubjects.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Award size={16} style={{ color: 'var(--gold-500)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  Non-Credit Subjects
                </span>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                  {nonCreditSubjects.length} subjects
                </span>
              </div>
              {nonCreditSubjects.map((sub) => (
                <div
                  key={sub.name}
                  className="glass-card"
                  style={{
                    padding: '0.9rem 1.1rem',
                    marginBottom: '0.625rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    opacity: 0.8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {sub.name}
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                    S (Pass)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* right — SGPA summary card (sticky) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{ position: 'sticky', top: 'calc(var(--topbar-height) + 1.5rem)' }}
        >
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              textAlign: 'center',
              borderTop: '3px solid var(--primary-500)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Calculator size={18} style={{ color: 'var(--primary-400)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {semester.name} Result
              </span>
            </div>

            {/* SGPA display */}
            <div
              style={{
                fontSize: '3rem',
                fontWeight: 900,
                background: sgpa > 0
                  ? 'linear-gradient(135deg, #2563eb, #06b6d4)'
                  : 'var(--text-muted)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
                marginBottom: '0.25rem',
              }}
            >
              {sgpa > 0 ? animSGPA : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              SGPA
            </div>

            {/* stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {totalCredits}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Total Credits
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.75rem' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {totalGradePoints}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Grade Points
                </div>
              </div>
            </div>

            {/* action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, opacity: allFilled ? 1 : 0.5, cursor: allFilled ? 'pointer' : 'not-allowed' }}
                onClick={handleSave}
                disabled={!allFilled}
              >
                <Save size={15} />
                {saved ? 'Saved!' : 'Save Result'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                style={{ padding: '0.625rem' }}
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {saved && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#10b981',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCircle2 size={14} /> Result saved successfully
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* mobile: responsive override */}
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
