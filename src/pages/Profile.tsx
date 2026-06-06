import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Palette, CheckCircle } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { calculateCGPA, getTotalCreditsEarned } from '../utils/calculations';
import { getAcademicStanding } from '../config/gradeSystem';
import { evaluateAchievements } from '../utils/achievements';
import { validateProfileField } from '../utils/validation';
import type { StudentProfile } from '../types';

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function Profile() {
  const { state, dispatch, getSemesterResults } = useAcademic();
  const results = getSemesterResults();

  const [form, setForm] = useState<StudentProfile>({ ...state.profile });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cgpa = useMemo(() => calculateCGPA(results), [results]);
  const totalCredits = useMemo(() => getTotalCreditsEarned(results), [results]);
  const standing = useMemo(() => getAcademicStanding(cgpa), [cgpa]);
  const achievements = useMemo(() => evaluateAchievements(results), [results]);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleChange = (field: keyof StudentProfile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    // Clear error for this field
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    const nameVal = validateProfileField('Name', form.name);
    if (!nameVal.valid) newErrors.name = nameVal.message;
    const enrollVal = validateProfileField('enrollmentNumber', form.enrollmentNumber);
    if (!enrollVal.valid) newErrors.enrollmentNumber = enrollVal.message;
    const deptVal = validateProfileField('Department', form.department);
    if (!deptVal.valid) newErrors.department = deptVal.message;
    const batchVal = validateProfileField('Batch', form.batch);
    if (!batchVal.valid) newErrors.batch = batchVal.message;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch({ type: 'SET_PROFILE', payload: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initial = form.name.trim() ? form.name.trim().charAt(0).toUpperCase() : '?';

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={28} style={{ color: 'var(--primary-500)' }} />
          Student Profile
        </h1>
        <p className="page-subtitle">Manage your personal information and view your academic summary</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Form */}
        <motion.div
          className="glass-card"
          style={{ padding: '1.5rem' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Edit Profile
          </h2>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Full Name
            </label>
            <input
              className="input-premium"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
            {errors.name && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>{errors.name}</p>}
          </div>

          {/* Enrollment */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Enrollment Number
            </label>
            <input
              className="input-premium"
              value={form.enrollmentNumber}
              onChange={(e) => handleChange('enrollmentNumber', e.target.value)}
              placeholder="e.g. 92400104001"
            />
            {errors.enrollmentNumber && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>{errors.enrollmentNumber}</p>}
          </div>

          {/* Department */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Department
            </label>
            <input
              className="input-premium"
              value={form.department}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="e.g. Computer Science and Engineering in AI/ML/DS"
            />
            {errors.department && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>{errors.department}</p>}
          </div>

          {/* Batch */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              Batch
            </label>
            <input
              className="input-premium"
              value={form.batch}
              onChange={(e) => handleChange('batch', e.target.value)}
              placeholder="e.g. 2024-2028"
            />
            {errors.batch && <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>{errors.batch}</p>}
          </div>

          {/* Avatar Color */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <Palette size={14} /> Avatar Color
            </label>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {AVATAR_COLORS.map((color) => (
                <motion.button
                  key={color}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleChange('avatarColor', color)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-full)',
                    background: color,
                    border: form.avatarColor === color ? '3px solid var(--text-primary)' : '3px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: form.avatarColor === color ? `0 0 12px ${color}60` : 'none',
                    transition: 'border 0.15s, box-shadow 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={handleSave}
            whileTap={{ scale: 0.97 }}
          >
            {saved ? <CheckCircle size={18} /> : <Save size={18} />}
            {saved ? 'Saved Successfully!' : 'Save Profile'}
          </motion.button>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          className="glass-card"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
            Profile Preview
          </h2>

          {/* Avatar */}
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 'var(--radius-full)',
              background: `linear-gradient(135deg, ${form.avatarColor}, ${form.avatarColor}CC)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '1.25rem',
              boxShadow: `0 8px 24px ${form.avatarColor}40`,
            }}
          >
            {initial}
          </motion.div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {form.name || 'Your Name'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.125rem' }}>
            {form.enrollmentNumber || 'Enrollment Number'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.125rem' }}>
            {form.department || 'Department'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Batch: {form.batch || '—'}
          </p>

          {/* Academic Summary */}
          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Academic Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(59,130,246,0.06)' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--primary-500)' }}>
                  {results.length > 0 ? cgpa.toFixed(2) : '—'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>CGPA</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--emerald-500)' }}>
                  {totalCredits}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Credits</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.06)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: standing.color }}>
                  {standing.icon} {results.length > 0 ? standing.label : '—'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Standing</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(212,175,55,0.06)' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--gold-500)' }}>
                  {unlockedCount}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Achievements</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
