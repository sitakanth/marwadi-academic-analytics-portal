import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  icon?: string;
}

export default function EmptyState({ title, description, actionLabel, actionPath, icon = '📚' }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Animated Illustration */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 rounded-3xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(6,182,212,0.1))',
          }}>
          <span className="text-5xl">{icon}</span>
          {/* Decorative orbs */}
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-60"
            style={{ background: 'var(--gold-500)' }} />
          <div className="absolute -bottom-1 -left-3 w-4 h-4 rounded-full opacity-40"
            style={{ background: 'var(--cyan-500)' }} />
          <div className="absolute top-1/2 -right-5 w-3 h-3 rounded-full opacity-30"
            style={{ background: 'var(--emerald-500)' }} />
        </div>
      </motion.div>

      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-md mb-6" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      {actionLabel && actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          className="btn btn-primary"
        >
          {actionLabel}
          <ArrowRight size={16} />
        </button>
      )}
    </motion.div>
  );
}
