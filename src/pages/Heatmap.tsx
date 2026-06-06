import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, LayoutGrid } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { getSemesterById } from '../data/semesters';
import { GRADE_MAP } from '../config/gradeSystem';
import EmptyState from '../components/ui/EmptyState';

function gradeToColor(points: number): string {
  if (points >= 10) return '#047857';
  if (points >= 9) return '#059669';
  if (points >= 8) return '#10B981';
  if (points >= 7) return '#34D399';
  if (points >= 6) return '#6EE7B7';
  if (points >= 5) return '#FCD34D';
  if (points >= 4) return '#FBBF24';
  if (points >= 1) return '#F97316';
  return '#DC2626';
}

function sgpaToColor(sgpa: number): string {
  if (sgpa >= 9.5) return '#047857';
  if (sgpa >= 9.0) return '#059669';
  if (sgpa >= 8.5) return '#10B981';
  if (sgpa >= 8.0) return '#34D399';
  if (sgpa >= 7.5) return '#6EE7B7';
  if (sgpa >= 7.0) return '#A7F3D0';
  if (sgpa >= 6.0) return '#FCD34D';
  if (sgpa >= 5.0) return '#FBBF24';
  if (sgpa >= 4.0) return '#F97316';
  return '#DC2626';
}

const legendItems = [
  { points: '10', color: '#047857', label: 'O (10)' },
  { points: '9', color: '#059669', label: 'A+ (9)' },
  { points: '8', color: '#10B981', label: 'A (8)' },
  { points: '7', color: '#34D399', label: 'B+ (7)' },
  { points: '6', color: '#6EE7B7', label: 'B (6)' },
  { points: '5', color: '#FCD34D', label: 'C (5)' },
  { points: '4', color: '#FBBF24', label: 'D (4)' },
  { points: '0', color: '#DC2626', label: 'F (0)' },
];

export default function Heatmap() {
  const { getSemesterResults } = useAcademic();
  const results = getSemesterResults();
  const [view, setView] = useState<'detailed' | 'simple'>('detailed');

  const completedSemesters = useMemo(
    () => results.map((r) => ({ ...r, semester: getSemesterById(r.semesterId)! })).filter((r) => r.semester),
    [results]
  );

  if (results.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          title="No Heatmap Data"
          description="Enter your semester grades to visualize your performance heatmap."
          actionLabel="Enter Grades"
          actionPath="/sgpa"
          icon="🗺️"
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Grid3X3 size={28} style={{ color: 'var(--primary-500)' }} />
          Performance Heatmap
        </h1>
        <p className="page-subtitle">Visualize your grades as a color-coded grid across all semesters</p>
      </motion.div>

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}
      >
        <button
          className={`btn ${view === 'detailed' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setView('detailed')}
          style={{ fontSize: '0.8125rem' }}
        >
          <Grid3X3 size={16} /> Detailed
        </button>
        <button
          className={`btn ${view === 'simple' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setView('simple')}
          style={{ fontSize: '0.8125rem' }}
        >
          <LayoutGrid size={16} /> SGPA Blocks
        </button>
      </motion.div>

      {/* Color Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '1rem' }}>
          Legend
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {legendItems.map((item) => (
            <div key={item.points} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: item.color }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Heatmap View */}
      {view === 'detailed' && (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ padding: '1.5rem', overflowX: 'auto' }}
        >
          {completedSemesters.map((result, sIdx) => (
            <div key={result.semesterId} style={{ marginBottom: sIdx < completedSemesters.length - 1 ? '1.5rem' : 0 }}>
              <h3 style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                {result.semester.name}
                <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                  SGPA: {result.sgpa.toFixed(2)}
                </span>
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {result.grades.map((grade, gIdx) => {
                  const points = grade.isNonCredit ? -1 : (GRADE_MAP[grade.grade] ?? 0);
                  const color = grade.isNonCredit ? 'var(--slate-400)' : gradeToColor(points);
                  return (
                    <motion.div
                      key={`${result.semesterId}-${gIdx}`}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: sIdx * 0.15 + gIdx * 0.04, duration: 0.3 }}
                      title={`${grade.subjectName}: ${grade.grade} (${grade.isNonCredit ? 'Non-credit' : points + ' pts'})`}
                      style={{
                        width: 'auto',
                        minWidth: 60,
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: grade.isNonCredit ? 'var(--border-color)' : `${color}20`,
                        border: `2px solid ${color}`,
                        textAlign: 'center',
                        cursor: 'default',
                      }}
                    >
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
                        {grade.subjectName.length > 15 ? grade.subjectName.slice(0, 15) + '…' : grade.subjectName}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color }}>
                        {grade.grade}
                      </div>
                      {!grade.isNonCredit && (
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                          {grade.credits} cr
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Simple SGPA Block View */}
      {view === 'simple' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}
        >
          {completedSemesters.map((result, idx) => {
            const color = sgpaToColor(result.sgpa);
            return (
              <motion.div
                key={result.semesterId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                  border: `2px solid ${color}60`,
                  textAlign: 'center',
                  cursor: 'default',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {result.semester.name}
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color }}>
                  {result.sgpa.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {result.semester.totalCredits} credits
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
