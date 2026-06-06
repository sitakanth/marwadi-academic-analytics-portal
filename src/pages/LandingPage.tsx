import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Calculator,
  BarChart3,
  Target,
  LineChart,
  Trophy,
  FileText,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ChevronDown,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';
import { BRANDING } from '../config/branding';
import { SEMESTERS, getTotalProgramCredits } from '../data/semesters';

/* ──────────────── helpers ──────────────── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const floatVariants = (delay: number) => ({
  animate: {
    y: [0, -12, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay },
  },
});

const FEATURES = [
  {
    icon: Calculator,
    title: 'SGPA Calculator',
    description: 'Calculate your Semester Grade Point Average with real-time grade entry and instant results.',
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  },
  {
    icon: BarChart3,
    title: 'CGPA Calculator',
    description: 'Compute your Cumulative GPA across all semesters with weighted credit calculations.',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
  },
  {
    icon: Target,
    title: 'Grade Predictor',
    description: 'Predict expected results and see how future grades will impact your overall CGPA.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
  },
  {
    icon: LineChart,
    title: 'Analytics',
    description: 'Advanced performance analytics with trend charts, radar graphs, and distribution insights.',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
  },
  {
    icon: TrendingUp,
    title: 'Goal Planner',
    description: 'Set target CGPAs and get personalized plans showing exactly what SGPAs you need.',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  },
  {
    icon: Trophy,
    title: 'Achievements',
    description: 'Unlock academic badges and achievements as you progress through your academic journey.',
    gradient: 'linear-gradient(135deg, #d4af37, #e5c158)',
  },
  {
    icon: FileText,
    title: 'PDF Reports',
    description: 'Generate professional academic reports with charts, insights, and comprehensive summaries.',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
  },
];

const STATS = [
  { label: 'Semesters', value: `${SEMESTERS.length}`, icon: BookOpen },
  { label: 'Credits', value: `${getTotalProgramCredits()}`, icon: Award },
  { label: 'Analytics', value: '15+', icon: Zap },
];

/* ──────────────── component ──────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });
  const previewRef = useRef<HTMLDivElement>(null);
  const previewInView = useInView(previewRef, { once: true, margin: '-60px' });

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ═══════════ HERO ═══════════ */}
      <section
        className="gradient-hero"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '2rem 1.5rem',
          overflow: 'hidden',
        }}
      >
        {/* ambient glows */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '60%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{
            textAlign: 'center',
            maxWidth: 860,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* badge */}
          <motion.div variants={item} style={{ marginBottom: '1.5rem' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(212,175,55,0.15)',
                color: '#e5c158',
                fontSize: '0.8rem',
                padding: '0.4rem 1rem',
                border: '1px solid rgba(212,175,55,0.25)',
              }}
            >
              <GraduationCap size={14} />
              {BRANDING.department}
            </span>
          </motion.div>

          {/* university name */}
          <motion.h1
            variants={item}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '0.5rem',
            }}
          >
            {BRANDING.universityName}
          </motion.h1>

          {/* portal name */}
          <motion.h2
            variants={item}
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '1.25rem',
              background: 'linear-gradient(135deg, #60a5fa, #22d3ee, #d4af37)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {BRANDING.portalName}
          </motion.h2>

          {/* tagline */}
          <motion.p
            variants={item}
            style={{
              fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
              color: 'rgba(148,163,184,0.9)',
              maxWidth: 640,
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            {BRANDING.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={item}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/dashboard')}
              style={{ gap: '0.5rem' }}
            >
              <Sparkles size={18} />
              Launch Dashboard
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={scrollToFeatures}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Explore Features
              <ChevronDown size={16} />
            </button>
          </motion.div>
        </motion.div>

        {/* floating stat counters */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          style={{
            display: 'flex',
            gap: '1.5rem',
            marginTop: '4rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={item}
              {...floatVariants(i * 0.5)}
              animate="animate"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 2rem',
                textAlign: 'center',
                minWidth: 140,
              }}
            >
              <stat.icon size={22} style={{ color: '#60a5fa', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(148,163,184,0.8)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: '2rem',
            color: 'rgba(148,163,184,0.5)',
            cursor: 'pointer',
          }}
          onClick={scrollToFeatures}
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section
        ref={featuresRef}
        className="gradient-mesh"
        style={{ padding: 'clamp(3rem,8vw,6rem) 1.5rem' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '3.5rem' }}
          >
            <span
              className="badge badge-primary"
              style={{ marginBottom: '1rem', display: 'inline-flex' }}
            >
              <Sparkles size={12} />
              Powerful Features
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                marginBottom: '0.75rem',
              }}
            >
              Everything You Need for Academic Excellence
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                maxWidth: 560,
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              A comprehensive suite of tools designed to help you track, analyze, and improve your
              academic performance.
            </p>
          </motion.div>

          {/* feature cards grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={featuresInView ? 'show' : 'hidden'}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="glass-card"
                style={{ padding: '1.75rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              >
                {/* top accent line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: feature.gradient,
                    opacity: 0.8,
                  }}
                />
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: `0 4px 15px ${feature.gradient.includes('#2563eb') ? 'rgba(37,99,235,0.3)' : 'rgba(0,0,0,0.15)'}`,
                  }}
                >
                  <feature.icon size={22} color="#ffffff" />
                </div>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ DASHBOARD PREVIEW ═══════════ */}
      <section
        ref={previewRef}
        style={{
          padding: 'clamp(3rem,8vw,6rem) 1.5rem',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={previewInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <span
              className="badge badge-gold"
              style={{ marginBottom: '1rem', display: 'inline-flex' }}
            >
              <BarChart3 size={12} />
              Dashboard Preview
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.025em',
                marginBottom: '0.75rem',
              }}
            >
              Your Analytics Command Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              A world-class dashboard with real-time KPIs, interactive charts, and actionable
              academic insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={previewInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            style={{
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              background: 'var(--bg-card)',
              boxShadow: '0 25px 60px -12px var(--shadow-color)',
              position: 'relative',
            }}
          >
            {/* mock dashboard preview */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary-950), var(--primary-800))',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: 'rgba(148,163,184,0.6)',
                }}
              >
                localhost:5173/dashboard
              </div>
            </div>
            <div style={{ padding: '2rem', minHeight: 320 }}>
              {/* KPI preview row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                {[
                  { label: 'CGPA', value: '8.75', color: '#2563eb' },
                  { label: 'Latest SGPA', value: '9.12', color: '#10b981' },
                  { label: 'Standing', value: 'Distinction', color: '#d4af37' },
                  { label: 'Credits', value: '81/108', color: '#06b6d4' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      borderTop: `3px solid ${kpi.color}`,
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {kpi.label}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: kpi.color }}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>
              {/* chart placeholders */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                }}
              >
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      height: 140,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LineChart size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, var(--bg-card) 0%, transparent 60%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '2rem',
              }}
            >
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/dashboard')}
                style={{ gap: '0.5rem' }}
              >
                Open Dashboard
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer
        style={{
          background: 'var(--primary-950)',
          padding: '3rem 1.5rem 2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GraduationCap size={28} style={{ color: '#60a5fa' }} />
            <div>
              <div style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1.05rem' }}>
                {BRANDING.universityName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)' }}>
                {BRANDING.address}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['Dashboard', 'SGPA', 'CGPA', 'Analytics'].map((link) => (
              <span
                key={link}
                onClick={() => navigate(`/${link.toLowerCase()}`)}
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(148,163,184,0.7)',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#60a5fa')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(148,163,184,0.7)')}
              >
                {link}
              </span>
            ))}
          </div>

          <div
            style={{
              width: '100%',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.5)' }}>
              {BRANDING.footer.copyright}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.35)' }}>
              {BRANDING.footer.disclaimer} &middot; Powered by {BRANDING.footer.poweredBy}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
