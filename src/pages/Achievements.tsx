import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { evaluateAchievements } from '../utils/achievements';
import EmptyState from '../components/ui/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
};

export default function Achievements() {
  const { getSemesterResults } = useAcademic();
  const results = getSemesterResults();

  const achievements = useMemo(() => evaluateAchievements(results), [results]);
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  const progress = achievements.length > 0 ? (unlocked.length / achievements.length) * 100 : 0;

  if (results.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          title="Badges Loading..."
          description="Enter your semester grades to start unlocking academic achievements and badges."
          actionLabel="Enter Grades"
          actionPath="/sgpa"
          icon="🏅"
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={28} style={{ color: 'var(--gold-500)' }} />
          Academic Achievements
        </h1>
        <p className="page-subtitle">
          Track your badges and milestones throughout your academic journey
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{ padding: '1.5rem', marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Achievement Progress
          </span>
          <span
            className="badge badge-gold"
            style={{ fontSize: '0.8125rem' }}
          >
            {unlocked.length} of {achievements.length} Unlocked
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 12,
            borderRadius: 'var(--radius-full)',
            background: 'var(--border-color)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            style={{
              height: '100%',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(90deg, var(--gold-600), var(--gold-400))',
            }}
          />
        </div>
      </motion.div>

      {/* Unlocked Achievements */}
      {unlocked.length > 0 && (
        <>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>🏆</span> Unlocked
          </motion.h2>

          <motion.div
            className="grid-cards"
            style={{ marginBottom: '2rem' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {unlocked.map((achievement) => (
              <motion.div
                key={achievement.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: `linear-gradient(135deg, ${achievement.color}18, ${achievement.color}08)`,
                  border: `1px solid ${achievement.color}40`,
                  boxShadow: `0 0 20px ${achievement.color}15, 0 4px 16px var(--shadow-color)`,
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow effect */}
                <div
                  style={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `${achievement.color}12`,
                    filter: 'blur(30px)',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{achievement.icon}</span>
                    <span
                      className="badge badge-success"
                      style={{ fontSize: '0.6875rem' }}
                    >
                      ✓ Unlocked
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                    {achievement.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {achievement.description}
                  </p>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: achievement.color,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <span>🎯</span> {achievement.condition}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* Locked Achievements */}
      {locked.length > 0 && (
        <>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Lock size={18} /> Locked
          </motion.h2>

          <motion.div
            className="grid-cards"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {locked.map((achievement) => (
              <motion.div
                key={achievement.id}
                variants={cardVariants}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  opacity: 0.5,
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Lock overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  <Lock size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem', lineHeight: 1, filter: 'grayscale(80%)' }}>
                      {achievement.icon}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                    {achievement.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    {achievement.description}
                  </p>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <span>🎯</span> {achievement.condition}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
