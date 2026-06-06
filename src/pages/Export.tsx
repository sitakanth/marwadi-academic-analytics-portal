import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAcademic } from '../context/AcademicContext';
import { BRANDING } from '../config/branding';
import { getSemesterById, getElectiveLabel } from '../data/semesters';
import { calculateCGPA, getTotalCreditsEarned, getHighestSGPA, getPerformanceGrowth } from '../utils/calculations';
import { GRADE_MAP } from '../config/gradeSystem';
import { getAcademicStanding, cgpaToPercentage } from '../config/gradeSystem';
import { TOTAL_PROGRAM_CREDITS } from '../data/semesters';
import EmptyState from '../components/ui/EmptyState';

export default function Export() {
  const { state, getSemesterResults } = useAcademic();
  const results = getSemesterResults();
  const [isExporting, setIsExporting] = useState(false);

  const cgpa = useMemo(() => calculateCGPA(results), [results]);
  const totalCredits = useMemo(() => getTotalCreditsEarned(results), [results]);
  const standing = useMemo(() => getAcademicStanding(cgpa), [cgpa]);
  const highest = useMemo(() => getHighestSGPA(results), [results]);
  const growth = useMemo(() => getPerformanceGrowth(results), [results]);
  const profile = state.profile;

  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const generatedDateTime = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleDownloadPDF = async () => {
    if (results.length === 0) return;
    setIsExporting(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const navy = [30, 58, 138] as [number, number, number];
      const white = [255, 255, 255] as [number, number, number];
      const lightBg = [248, 250, 252] as [number, number, number];
      const altRow = [241, 245, 249] as [number, number, number];
      const textDark = [15, 23, 42] as [number, number, number];
      const textMuted = [100, 116, 139] as [number, number, number];

      // ═══ HEADER ═══
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...navy);
      pdf.text(BRANDING.universityName, pageWidth / 2, y + 8, { align: 'center' });

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textMuted);
      pdf.text(BRANDING.department, pageWidth / 2, y + 15, { align: 'center' });
      pdf.text(BRANDING.address, pageWidth / 2, y + 20, { align: 'center' });

      y += 25;

      // Divider
      pdf.setDrawColor(...navy);
      pdf.setLineWidth(0.8);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Document title
      pdf.setFillColor(239, 246, 255);
      pdf.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...navy);
      pdf.text('Academic Performance Report', pageWidth / 2, y + 7, { align: 'center' });
      y += 16;

      // ═══ STUDENT INFO TABLE ═══
      autoTable(pdf, {
        startY: y,
        head: [['Student Information', '', '', '']],
        body: [
          ['Student Name', profile.name || 'Not Provided', 'Enrollment No.', profile.enrollmentNumber || 'Not Provided'],
          ['Department', profile.department || 'Not Provided', 'Batch', profile.batch || 'Not Provided'],
          ['Generated Date', generatedDate, '', ''],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: navy,
          textColor: white,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: textDark,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: lightBg,
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: textMuted, cellWidth: 32 },
          1: { cellWidth: 55 },
          2: { fontStyle: 'bold', textColor: textMuted, cellWidth: 32 },
          3: { cellWidth: 55 },
        },
        margin: { left: margin, right: margin },
      });

      y = (pdf as any).lastAutoTable.finalY + 8;

      // ═══ SUMMARY TABLE ═══
      const remainingCredits = TOTAL_PROGRAM_CREDITS - totalCredits;
      const highestSem = highest ? `Semester ${highest.semesterId}` : '—';

      autoTable(pdf, {
        startY: y,
        head: [['Academic Summary', '', '', '']],
        body: [
          ['Overall CGPA', cgpa.toFixed(2), 'Academic Standing', `${standing.icon} ${standing.label}`],
          ['Completed Credits', `${totalCredits}`, 'Total Program Credits', `${TOTAL_PROGRAM_CREDITS}`],
          ['Remaining Credits', `${remainingCredits}`, 'Percentage Equivalent', `${cgpaToPercentage(cgpa)}%`],
          ['Highest SGPA', `${highest?.sgpa.toFixed(2) ?? '—'} (${highestSem})`, 'Performance Growth', `${growth >= 0 ? '+' : ''}${growth}%`],
        ],
        theme: 'grid',
        headStyles: {
          fillColor: navy,
          textColor: white,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: textDark,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: lightBg,
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: textMuted, cellWidth: 32 },
          1: { cellWidth: 55 },
          2: { fontStyle: 'bold', textColor: textMuted, cellWidth: 32 },
          3: { cellWidth: 55 },
        },
        margin: { left: margin, right: margin },
      });

      y = (pdf as any).lastAutoTable.finalY + 10;

      // ═══ SEMESTER-WISE TABLES ═══
      for (const result of results) {
        const sem = getSemesterById(result.semesterId);
        if (!sem) continue;

        // Check if we need a new page (leave room for header + at least a few rows)
        if (y > 240) {
          pdf.addPage();
          y = margin;
        }

        // Semester title
        let semTitle = `${sem.name} — SGPA: ${result.sgpa.toFixed(2)}`;
        if (result.semesterId === 8) {
          semTitle = `${sem.name} — Major Project - 2 / Internship — SGPA: ${result.sgpa.toFixed(2)}`;
        }

        const tableBody: (string | number)[][] = [];

        for (const g of result.grades) {
          const isNonCredit = g.isNonCredit;
          const gradePoints = isNonCredit ? '—' : (GRADE_MAP[g.grade] ?? 0);
          const creditDisplay = isNonCredit ? '—' : g.credits;
          const gradePointsDisplay = isNonCredit ? '—' : (typeof gradePoints === 'number' ? (g.credits * gradePoints).toString() : '—');

          // Build subject name with labels
          let subjectName = g.subjectName;
          if (g.electiveGroupId) {
            subjectName = `${subjectName} (${getElectiveLabel(g.electiveGroupId)})`;
          }
          if (g.isProject) {
            subjectName = `${subjectName} [Project]`;
          }

          tableBody.push([
            g.code || '—',
            subjectName,
            creditDisplay.toString(),
            g.grade,
            gradePointsDisplay.toString(),
          ]);
        }

        autoTable(pdf, {
          startY: y,
          head: [[
            { content: semTitle, colSpan: 5, styles: { halign: 'left' } },
          ]],
          body: tableBody.length > 0 ? tableBody : [['—', 'No subjects entered', '—', '—', '—']],
          columns: [
            { header: 'Subject Code', dataKey: '0' },
            { header: 'Subject Name', dataKey: '1' },
            { header: 'Credits', dataKey: '2' },
            { header: 'Grade', dataKey: '3' },
            { header: 'Grade Points', dataKey: '4' },
          ],
          theme: 'grid',
          headStyles: {
            fillColor: navy,
            textColor: white,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
          },
          bodyStyles: {
            fontSize: 8,
            textColor: textDark,
            cellPadding: 2.5,
          },
          alternateRowStyles: {
            fillColor: altRow,
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 24 },
            1: { halign: 'left' },
            2: { halign: 'center', cellWidth: 18 },
            3: { halign: 'center', cellWidth: 18, fontStyle: 'bold', textColor: navy },
            4: { halign: 'center', cellWidth: 24 },
          },
          margin: { left: margin, right: margin },
          showHead: 'firstPage',
          didDrawPage: () => {
            // Add column headers on continuation pages
          },
          willDrawCell: (data: any) => {
            // Add second header row (column names) after the semester title
            if (data.section === 'head' && data.row.index === 0) {
              // Title row styling
            }
          },
        });

        y = (pdf as any).lastAutoTable.finalY + 8;
      }

      // ═══ FOOTER ON ALL PAGES ═══
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const footerY = 285;

        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...textMuted);
        pdf.text(BRANDING.footer.disclaimer, pageWidth / 2, footerY, { align: 'center' });
        pdf.text(`Generated on: ${generatedDateTime}`, pageWidth / 2, footerY + 3.5, { align: 'center' });
        pdf.text(BRANDING.footer.copyright, pageWidth / 2, footerY + 7, { align: 'center' });

        // Page numbers
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
      }

      pdf.save('Academic_Performance_Report.pdf');
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

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileDown size={28} style={{ color: 'var(--primary-500)' }} />
          Academic Report Export
        </h1>
        <p className="page-subtitle">Generate and download your professional academic performance report as PDF</p>
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
          {isExporting ? 'Generating PDF...' : 'Download PDF Report'}
        </button>
      </motion.div>

      {/* Report Preview */}
      <motion.div
        className="glass-card"
        style={{ padding: '1.5rem', overflow: 'auto' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Eye size={18} style={{ color: 'var(--primary-400)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Report Preview</span>
        </div>

        <div
          style={{
            background: '#ffffff',
            color: '#0f172a',
            padding: '40px',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            maxWidth: 800,
            margin: '0 auto',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
          }}
        >
          {/* University Header */}
          <div style={{ textAlign: 'center', marginBottom: 28, borderBottom: '3px solid #1E3A8A', paddingBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1E3A8A', marginBottom: 4, letterSpacing: '-0.02em' }}>
              {BRANDING.universityName}
            </h1>
            <p style={{ fontSize: 13, color: '#475569', marginBottom: 2 }}>{BRANDING.department}</p>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>{BRANDING.address}</p>
            <div style={{ marginTop: 10, display: 'inline-block', padding: '4px 16px', background: '#EFF6FF', borderRadius: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A' }}>
                Academic Performance Report
              </span>
            </div>
          </div>

          {/* Student Info */}
          <div style={{ marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#1E3A8A' }}>
                  <th colSpan={4} style={{ padding: '8px 12px', color: '#fff', fontWeight: 600, textAlign: 'center', fontSize: 11 }}>
                    Student Information
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '7px 12px', fontWeight: 600, color: '#64748b', width: '20%', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Student Name</td>
                  <td style={{ padding: '7px 12px', color: '#0f172a', width: '30%', border: '1px solid #e2e8f0' }}>{profile.name || 'Not Provided'}</td>
                  <td style={{ padding: '7px 12px', fontWeight: 600, color: '#64748b', width: '20%', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Enrollment No.</td>
                  <td style={{ padding: '7px 12px', color: '#0f172a', width: '30%', border: '1px solid #e2e8f0' }}>{profile.enrollmentNumber || 'Not Provided'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '7px 12px', fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Department</td>
                  <td style={{ padding: '7px 12px', color: '#0f172a', border: '1px solid #e2e8f0' }}>{profile.department || 'Not Provided'}</td>
                  <td style={{ padding: '7px 12px', fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Batch</td>
                  <td style={{ padding: '7px 12px', color: '#0f172a', border: '1px solid #e2e8f0' }}>{profile.batch || 'Not Provided'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div style={{ padding: 16, background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', borderRadius: 8, color: '#fff', marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CGPA</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{cgpa.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Credits</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{totalCredits}/{TOTAL_PROGRAM_CREDITS}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Standing</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{standing.icon} {standing.label}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Percentage</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{cgpaToPercentage(cgpa)}%</div>
            </div>
          </div>

          {/* Semester Tables */}
          {results.map((result) => {
            const sem = getSemesterById(result.semesterId);
            if (!sem) return null;
            return (
              <div key={result.semesterId} style={{ marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#1E3A8A' }}>
                      <th colSpan={5} style={{ padding: '8px 12px', color: '#fff', fontWeight: 600, textAlign: 'left', fontSize: 11 }}>
                        {sem.name} — SGPA: {result.sgpa.toFixed(2)}
                        {result.semesterId === 8 && ' — Major Project - 2 / Internship'}
                      </th>
                    </tr>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', width: 80 }}>Code</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0' }}>Subject Name</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', width: 60 }}>Credits</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', width: 60 }}>Grade</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#475569', border: '1px solid #e2e8f0', width: 80 }}>Grade Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.grades.map((g, i) => {
                      const isNC = g.isNonCredit;
                      const gradePoint = isNC ? 0 : (GRADE_MAP[g.grade] ?? 0);
                      let subjectName = g.subjectName;
                      if (g.electiveGroupId) {
                        subjectName = `${subjectName} (${getElectiveLabel(g.electiveGroupId)})`;
                      }
                      if (g.isProject) {
                        subjectName = `${subjectName} [Project]`;
                      }
                      return (
                        <tr key={i} style={{ background: i % 2 === 1 ? '#f8fafc' : '#fff' }}>
                          <td style={{ padding: '5px 10px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0', fontSize: 10 }}>{g.code || '—'}</td>
                          <td style={{ padding: '5px 10px', color: '#0f172a', border: '1px solid #e2e8f0' }}>{subjectName}</td>
                          <td style={{ padding: '5px 10px', textAlign: 'center', color: '#475569', border: '1px solid #e2e8f0' }}>
                            {isNC ? '—' : g.credits}
                          </td>
                          <td style={{ padding: '5px 10px', textAlign: 'center', fontWeight: 600, color: '#1E3A8A', border: '1px solid #e2e8f0' }}>
                            {g.grade}
                          </td>
                          <td style={{ padding: '5px 10px', textAlign: 'center', color: '#475569', border: '1px solid #e2e8f0' }}>
                            {isNC ? '—' : (g.credits * gradePoint).toString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}

          {/* Footer */}
          <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
              {BRANDING.footer.disclaimer}
            </p>
            <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
              Generated on: {generatedDateTime}
            </p>
            <p style={{ fontSize: 9, color: '#cbd5e1' }}>
              {BRANDING.footer.copyright}
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
