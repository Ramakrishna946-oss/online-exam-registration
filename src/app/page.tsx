import Link from 'next/link'
import { BookOpen, CheckCircle, Clock, Shield, Award, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.35rem', color: 'var(--primary)' }}>
            <BookOpen size={28} />
            <span>Online Exam Registration System</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/login" className="btn btn-outline">Login</Link>
            <Link href="/register" className="btn btn-primary">Register Now</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{ padding: '6rem 1rem', textAlign: 'center', background: 'linear-gradient(to bottom, #eff6ff, #ffffff)' }}>
          <div className="container" style={{ maxWidth: '850px' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2 }}>
              Online Exam Registration System
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
              A modern, secure, and intuitive platform for students and educational institutions.
              Register for upcoming examinations, attempt real-time quizzes, track registrations, and view instant evaluated results.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/register" className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '0.75rem 2rem' }}>
                Student Registration
              </Link>
              <Link href="/login" className="btn btn-outline" style={{ fontSize: '1.125rem', padding: '0.75rem 2rem', background: 'var(--surface)' }}>
                Portal Login
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '5rem 1rem', background: 'var(--surface)' }}>
          <div className="container">
            <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>Key Platform Features</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#eff6ff', color: 'var(--primary)', borderRadius: '50%' }}>
                  <Shield size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Secure Role-based Access</h3>
                <p style={{ color: 'var(--text-muted)' }}>Separate authenticated dashboards for candidates and administrative examination controllers.</p>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f0fdf4', color: 'var(--success)', borderRadius: '50%' }}>
                  <Clock size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Instant Registration & Timers</h3>
                <p style={{ color: 'var(--text-muted)' }}>Seamless exam enrollment, automatic validation, duplicate check, and timed testing.</p>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#fef3c7', color: 'var(--warning)', borderRadius: '50%' }}>
                  <Award size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Automated Result Evaluation</h3>
                <p style={{ color: 'var(--text-muted)' }}>Real-time evaluation, total marks calculation, percentage analytics, and pass/fail grading.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--text-main)', color: 'white', padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
            <BookOpen />
            <span>Online Exam Registration System</span>
          </div>
          <p style={{ color: '#94a3b8' }}>© 2026 Online Exam Registration System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
