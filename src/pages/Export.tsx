import { useRef, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAcademic } from '../context/AcademicContext';
import { BRANDING } from '../config/branding';
import { getSemesterById } from '../data/semesters';
import { calculateCGPA, getTotalCreditsEarned } from '../utils/calculations';
import { GRADE_MAP } from '../config/gradeSystem';
import { getAcademicStanding } from '../config/gradeSystem';
import { evaluateAchievements } from '../utils/achievements';
import { APP_CONFIG } from '../config/appConfig';
import EmptyState from '../components/ui/EmptyState';

export default function Export() {
  const { state, getSemesterResults } = useAcademic();
  const results = getSemesterResults();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const cgpa = useMemo(() => calculateCGPA(results), [results]);
  const totalCredits = useMemo(() => getTotalCreditsEarned(results), [results]);
  const standing = useMemo(() => getAcademicStanding(cgpa), [cgpa]);
  const achievements = useMemo(() => evaluateAchievements(results), [results]);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const profile = state.profile;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = APP_CONFIG.pdf.pageWidth;
      const pdfHeight = APP_CONFIG.pdf.pageHeight;
      const margin = APP_CONFIG.pdf.margin;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let yOffset = 0;
      const pageContentHeight = pdfHeight - margin * 2;

      while (yOffset < contentHeight) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, margin - yOffset, contentWidth, contentHeight);
        yOffset += pageContentHeight;
      }

      pdf.save('Academic_Report.pdf');
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (results.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          title="No Report Data"
          description="Enter your semester grades to generate and export an academic report."
          actionLabel="Enter Grades"
          actionPath="/sgpa"
          icon="📄"
        />
      </div>
    );
  }

  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileDown size={28} style={{ color: 'var(--primary-500)' }} />
          Academic Report Export
        </h1>
        <p className="page-subtitle">Preview and download your comprehensive academic report as a PDF</p>
      </motion.div>

      {/* Download Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}
      >
        <button
          className="btn btn-primary btn-lg"
          onClick={handleDownloadPDF}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FileDown size={18} />}
          {isExporting ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </motion.div>

      {/* Report Preview */}
      <motion.div
        className="glass-card"
        style={{ padding: '1rem', overflow: 'auto' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div
          id="report-content"
          ref={reportRef}
          style={{
            background: '#ffffff',
            color: '#0f172a',
            padding: '40px',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            maxWidth: 800,
            margin: '0 auto',
            borderRadius: 8,
          }}
        >
          {/* University Header */}
          <div style={{ textAlign: 'center', marginBottom: 32, borderBottom: '3px solid #1E3A8A', paddingBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1E3A8A', marginBottom: 4, letterSpacing: '-0.02em' }}>
              {BRANDING.universityName}
            </h1>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 2 }}>{BRANDING.department}</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>{BRANDING.address}</p>
            <div style={{ marginTop: 12, display: 'inline-block', padding: '4px 16px', background: '#EFF6FF', borderRadius: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A' }}>
                Academic Performance Report
              </span>
            </div>
          </div>

          {/* Student Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28, padding: 16, background: '#F8FAFC', borderRadius: 8 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Student Name
              </span>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {profile.name || 'Not Provided'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enrollment No.
              </span>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {profile.enrollmentNumber || 'Not Provided'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Department
              </span>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {profile.department || 'Not Provided'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Batch
              </span>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {profile.batch || 'Not Provided'}
              </p>
            </div>
          </div>

          {/* Semester Tables */}
          {results.map((result) => {
            const sem = getSemesterById(result.semesterId);
            if (!sem) return null;
            return (
              <div key={result.semesterId} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E3A8A' }}>
                    {sem.name}
                  </h3>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981', background: '#ECFDF5', padding: '2px 10px', borderRadius: 12 }}>
                    SGPA: {result.sgpa.toFixed(2)}
                  </span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#475569', borderBottom: '2px solid #E2E8F0' }}>Subject</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#475569', borderBottom: '2px solid #E2E8F0', width: 70 }}>Credits</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#475569', borderBottom: '2px solid #E2E8F0', width: 70 }}>Grade</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#475569', borderBottom: '2px solid #E2E8F0', width: 100 }}>Grade Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.grades.map((g, i) => {
                      const points = g.isNonCredit ? '—' : (GRADE_MAP[g.grade] ?? 0);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '7px 12px', color: '#0f172a' }}>{g.subjectName}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', color: '#475569' }}>
                            {g.isNonCredit ? '—' : g.credits}
                          </td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', fontWeight: 600, color: '#1E3A8A' }}>
                            {g.grade}
                          </td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', color: '#475569' }}>
                            {typeof points === 'number' ? (g.credits * points).toFixed(0) : points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* CGPA Summary */}
          <div style={{ padding: 20, background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', borderRadius: 10, color: '#fff', marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CGPA</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{cgpa.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Credits</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{totalCredits}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Standing</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{standing.icon} {standing.label}</div>
            </div>
          </div>

          {/* Achievements */}
          {unlockedAchievements.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E3A8A', marginBottom: 10 }}>
                🏆 Achievements Unlocked
              </h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {unlockedAchievements.map((a) => (
                  <span
                    key={a.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 14px',
                      borderRadius: 20,
                      background: `${a.color}15`,
                      border: `1px solid ${a.color}40`,
                      fontSize: 12,
                      fontWeight: 600,
                      color: a.color,
                    }}
                  >
                    {a.icon} {a.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>
              {BRANDING.footer.disclaimer}
            </p>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>
              Generated on {generatedDate}
            </p>
            <p style={{ fontSize: 10, color: '#cbd5e1' }}>
              {BRANDING.footer.copyright} | Powered by {BRANDING.footer.poweredBy}
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
