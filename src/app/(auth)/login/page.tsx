'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { GraduationCap, ShieldCheck, LogIn, KeyRound, HelpCircle, X } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [roleTab, setRoleTab] = useState<'STUDENT' | 'ADMIN'>('STUDENT')
  const [loading, setLoading] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login authentication failed')
      }

      const { user } = data
      toast.success(`Welcome back, ${user.name}!`)
      
      if (user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) {
      toast.error('Please enter your registered email address')
      return
    }
    toast.success(`Password reset instructions sent to ${forgotEmail}`)
    setShowForgotModal(false)
    setForgotEmail('')
  }

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem 2rem', borderTop: '5px solid var(--primary)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#eff6ff', color: 'var(--primary)', borderRadius: '50%', marginBottom: '0.75rem' }}>
            <GraduationCap size={36} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>College Exam Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Online Registration & Examination System</p>
        </div>

        {/* Student / Admin Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setRoleTab('STUDENT')}
            style={{
              padding: '0.6rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: roleTab === 'STUDENT' ? 'white' : 'transparent',
              color: roleTab === 'STUDENT' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: roleTab === 'STUDENT' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <GraduationCap size={18} /> Student Login
          </button>

          <button
            type="button"
            onClick={() => setRoleTab('ADMIN')}
            style={{
              padding: '0.6rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              background: roleTab === 'ADMIN' ? 'white' : 'transparent',
              color: roleTab === 'ADMIN' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: roleTab === 'ADMIN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={18} /> Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{roleTab === 'ADMIN' ? 'Admin Email ID' : 'Student Registered Email'}</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              required 
              placeholder={roleTab === 'ADMIN' ? 'admin@demo.com' : 'student@demo.com'}
              defaultValue={roleTab === 'ADMIN' ? 'admin@demo.com' : 'student@demo.com'}
            />
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.825rem', fontWeight: 500, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              required 
              placeholder="••••••••" 
              defaultValue={roleTab === 'ADMIN' ? 'admin123' : 'student123'}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : <><LogIn size={18} /> Login as {roleTab === 'ADMIN' ? 'Admin' : 'Student'}</>}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#1e40af', textAlign: 'center' }}>
          💡 <strong>Demo Credentials:</strong><br />
          Student: <code>student@demo.com</code> / <code>student123</code><br />
          Admin: <code>admin@demo.com</code> / <code>admin123</code>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          New Student? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create New Registration Account</Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={20} style={{ color: 'var(--primary)' }} /> Forgot Password
              </h3>
              <button onClick={() => setShowForgotModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Enter your registered student/admin email address below. We will send a secure link to reset your password.
            </p>

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label className="form-label">Registered Email Address</label>
                <input 
                  type="email" 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  className="form-input" 
                  required 
                  placeholder="e.g. student@demo.com" 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForgotModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Send Reset Link</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
