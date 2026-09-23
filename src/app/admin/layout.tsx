'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, CheckSquare, ClipboardList, BarChart3, Bell, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out from Admin Panel')
      router.push('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Admin Sidebar */}
      <aside style={{ width: '270px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>
            RK COLLEGE ADMINISTRATION
          </span>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>Exam Control Office</h1>
        </div>
        
        <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <Link 
            href="/admin" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/admin') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/admin') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/admin') ? 600 : 400
            }}
          >
            <LayoutDashboard size={18} /> Admin Dashboard
          </Link>

          <Link 
            href="/admin/students" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/admin/students') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/admin/students') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/admin/students') ? 600 : 400
            }}
          >
            <Users size={18} /> Manage Students
          </Link>

          <Link 
            href="/admin/exams" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/admin/exams') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/admin/exams') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/admin/exams') ? 600 : 400
            }}
          >
            <FileText size={18} /> Manage Exams
          </Link>

          <Link 
            href="/admin/registrations" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/admin/registrations') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/admin/registrations') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/admin/registrations') ? 600 : 400
            }}
          >
            <ClipboardList size={18} /> Manage Registrations
          </Link>

          <Link 
            href="/admin/results" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/admin/results') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/admin/results') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/admin/results') ? 600 : 400
            }}
          >
            <CheckSquare size={18} /> Manage Results
          </Link>

          <Link 
            href="/admin/reports" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/admin/reports') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/admin/reports') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/admin/reports') ? 600 : 400
            }}
          >
            <BarChart3 size={18} /> View Reports
          </Link>

          <Link 
            href="/admin/notifications" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.75rem 1rem', 
              borderRadius: '0.5rem',
              color: isActive('/admin/notifications') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/admin/notifications') ? '#eff6ff' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive('/admin/notifications') ? 600 : 400
            }}
          >
            <Bell size={18} /> Send Notifications
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
