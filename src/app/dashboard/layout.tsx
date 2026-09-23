'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, FileText, CheckCircle, ClipboardList, User, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out')
      router.push('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '270px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '1.15rem' }}>
            <GraduationCap size={24} /> RK College Portal
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Student Examination Services</div>
        </div>
        
        <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <Link 
            href="/dashboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/dashboard') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/dashboard') ? 600 : 400
            }}
          >
            <LayoutDashboard size={18} /> Student Dashboard
          </Link>

          <Link 
            href="/dashboard/exams" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/dashboard/exams') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/dashboard/exams') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/dashboard/exams') ? 600 : 400
            }}
          >
            <FileText size={18} /> Exam Registration
          </Link>

          <Link 
            href="/dashboard/applications" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/dashboard/applications') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/dashboard/applications') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/dashboard/applications') ? 600 : 400
            }}
          >
            <ClipboardList size={18} /> Application Slips
          </Link>

          <Link 
            href="/dashboard/registrations" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/dashboard/registrations') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/dashboard/registrations') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/dashboard/registrations') ? 600 : 400
            }}
          >
            <FileText size={18} /> My Enrollments
          </Link>

          <Link 
            href="/dashboard/results" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/dashboard/results') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/dashboard/results') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/dashboard/results') ? 600 : 400
            }}
          >
            <CheckCircle size={18} /> My Results
          </Link>

          <Link 
            href="/dashboard/profile" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/dashboard/profile') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/dashboard/profile') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/dashboard/profile') ? 600 : 400
            }}
          >
            <User size={18} /> Candidate Profile
          </Link>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline" 
            style={{ width: '100%', color: 'var(--danger)', borderColor: '#fecaca' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
