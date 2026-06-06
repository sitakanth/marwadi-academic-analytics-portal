import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, LayoutGrid } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { SEMESTERS } from '../data/semesters';
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
  const { getSemesterResults, getResultForSemester } = useAcademic();
  const results = getSemesterResults();
  const [view, setView] = useState<'detailed' | 'simple'>('detailed');

  // Build data for all 8 semesters — completed ones have grades, others show as upcoming
  const allSemesterData = useMemo(() => {
    return SEMESTERS.map((semester) => {
      const result = getResultForSemester(semester.id);
      return {
        semester,
        result,
        hasData: !!result,
      };
    });
  }, [results, getResultForSemester]);

  const hasAnyData = results.length > 0;

  if (!hasAnyData) {
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
        <p className="page-subtitle">Visualize your grades as a color-coded grid across all 8 semesters</p>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Legend
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {legendItems.map((item) => (
              <div key={item.points} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: item.color }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginLeft: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem' }}>🔬</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Project</span>
          </div>
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
          {allSemesterData.map((data, sIdx) => (
            <div key={data.semester.id} style={{ marginBottom: sIdx < allSemesterData.length - 1 ? '1.5rem' : 0 }}>
              <h3 style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                {data.semester.name}
                {data.hasData && data.result ? (
                  <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>
                    SGPA: {data.result.sgpa.toFixed(2)}
                  </span>
                ) : (
                  <span className="badge" style={{ fontSize: '0.6875rem', background: 'var(--border-color)', color: 'var(--text-muted)' }}>
                    {data.semester.id <= results.length ? 'Not Entered' : 'Upcoming'}
                  </span>
                )}
              </h3>

              {data.hasData && data.result ? (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {data.result.grades.map((grade, gIdx) => {
                    const points = grade.isNonCredit ? -1 : (GRADE_MAP[grade.grade] ?? 0);
                    const color = grade.isNonCredit ? 'var(--slate-400)' : gradeToColor(points);
                    const isProject = grade.isProject ?? false;
                    const subjectCode = grade.code ?? '';
                    return (
                      <motion.div
                        key={`${data.semester.id}-${gIdx}`}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: sIdx * 0.1 + gIdx * 0.04, duration: 0.3 }}
                        title={`${grade.subjectName}${subjectCode ? ` (${subjectCode})` : ''}: ${grade.grade} (${grade.isNonCredit ? 'Non-credit' : points + ' pts'})`}
                        style={{
                          width: 'auto',
                          minWidth: 72,
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: grade.isNonCredit ? 'var(--border-color)' : `${color}20`,
                          border: `2px solid ${color}`,
                          textAlign: 'center',
                          cursor: 'default',
                          position: 'relative',
                        }}
                      >
                        {isProject && (
                          <span style={{ position: 'absolute', top: 2, right: 4, fontSize: '0.75rem' }} title="Project">
                            🔬
                          </span>
                        )}
                        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>
                          {grade.subjectName.length > 15 ? grade.subjectName.slice(0, 15) + '…' : grade.subjectName}
                        </div>
                        {subjectCode && (
                          <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '0.125rem' }}>
                            {subjectCode}
                          </div>
                        )}
                        <div style={{ fontSize: '1rem', fontWeight: 800, color }}>
                          {grade.grade}
                        </div>
                        {!grade.isNonCredit && (
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                            {grade.credits} cr
                          </div>
                        )}
                        {grade.isNonCredit && (
                          <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                            Non-credit
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px dashed var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8125rem',
                    textAlign: 'center',
                  }}
                >
                  {data.semester.id <= results.length ? 'No grades entered for this semester' : 'Grades will appear here once entered'}
                </div>
              )}
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
          {allSemesterData.map((data, idx) => {
            if (data.hasData && data.result) {
              const color = sgpaToColor(data.result.sgpa);
              return (
                <motion.div
                  key={data.semester.id}
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
                    {data.semester.name}
                  </div>
                  <div style={{ fontSize: '2.25rem', fontWeight: 800, color }}>
                    {data.result.sgpa.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {data.semester.totalCredits} credits
                  </div>
                </motion.div>
              );
            }
            // Upcoming / Not entered
            return (
              <motion.div
                key={data.semester.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  border: '2px dashed var(--border-color)',
                  textAlign: 'center',
                  cursor: 'default',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {data.semester.name}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {data.semester.id <= results.length ? 'Not Entered' : 'Upcoming'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {data.semester.totalCredits} credits
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
