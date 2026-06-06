import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { BRANDING } from '../config/branding';
import { APP_CONFIG } from '../config/appConfig';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, APP_CONFIG.loading.minDurationMs);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a1628 0%, #172a4a 50%, #1a1a4e 100%)',
      }}
    >
      {/* Decorative background orbs */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          top: '10%',
          left: '15%',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          bottom: '15%',
          right: '10%',
          filter: 'blur(40px)',
        }}
      />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(37,99,235,0.2)',
          }}
        >
          <GraduationCap size={40} color="#ffffff" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* University Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.025em',
          marginBottom: '0.375rem',
          textAlign: 'center',
        }}
      >
        {BRANDING.universityName}
      </motion.h1>

      {/* Portal Name */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        style={{
          fontSize: '0.9375rem',
          fontWeight: 500,
          color: '#93C5FD',
          marginBottom: '2.5rem',
          textAlign: 'center',
        }}
      >
        {BRANDING.portalName}
      </motion.p>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.8 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        style={{
          width: 200,
          height: 4,
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: (APP_CONFIG.loading.minDurationMs / 1000) * 0.9,
            ease: 'easeInOut',
          }}
          style={{
            height: '100%',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
            boxShadow: '0 0 12px rgba(59,130,246,0.5)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
