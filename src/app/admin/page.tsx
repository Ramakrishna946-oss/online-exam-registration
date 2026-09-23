'use client'

import { useEffect, useState } from 'react'
import { Users, FileText, CheckSquare, ClipboardList, PlusCircle, BarChart3, Bell, ShieldCheck, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    publishedExams: 0,
    totalRegistrations: 0,
    pendingApplications: 0,
    totalResults: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(res => res.json()),
      fetch('/api/admin/students').then(res => res.json()),
      fetch('/api/registrations').then(res => res.json()),
      fetch('/api/results').then(res => res.json())
    ]).then(([statsData, studentsData, regData, resultsData]) => {
      const regs = regData?.registrations || []
      const pending = regs.filter((r: any) => r.appStatus === 'PENDING' || r.paymentStatus === 'PENDING').length

      setStats({
        totalStudents: studentsData?.students?.length || statsData?.totalStudents || 0,
        totalExams: statsData?.totalExams || 0,
        publishedExams: statsData?.publishedExams || 0,
        totalRegistrations: regs.length,
        pendingApplications: pending,
        totalResults: resultsData?.results?.length || statsData?.completedAttempts || 0
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading admin control panel...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', background: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
          Examination Control Office
        </span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.4rem', marginBottom: '0.25rem' }}>
          Admin Management Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of student enrollments, exam schedules, registration applications, reports, and broadcasts.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ padding: '1rem', background: '#eff6ff', color: 'var(--primary)', borderRadius: '50%' }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Registered Students</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.totalStudents}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ padding: '1rem', background: '#f0fdf4', color: 'var(--success)', borderRadius: '50%' }}>
            <FileText size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Active Exams</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.totalExams}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ padding: '1rem', background: '#f5f3ff', color: '#8b5cf6', borderRadius: '50%' }}>
            <ClipboardList size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Registrations</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.totalRegistrations}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ padding: '1rem', background: '#fef3c7', color: 'var(--warning)', borderRadius: '50%' }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pending Applications</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.pendingApplications}</div>
          </div>
        </div>
      </div>

      {/* Quick Administration Controls */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>College Administration Modules</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        
        <Link href="/admin/students" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Users size={28} style={{ color: 'var(--primary)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Manage Students</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>View student profiles & candidate info</div>
          </div>
        </Link>

        <Link href="/admin/exams" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FileText size={28} style={{ color: 'var(--success)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Manage Exams</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Setup exam codes, fees & question banks</div>
          </div>
        </Link>

        <Link href="/admin/registrations" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ClipboardList size={28} style={{ color: '#8b5cf6' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Manage Registrations</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Review application numbers & approval status</div>
          </div>
        </Link>

        <Link href="/admin/reports" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BarChart3 size={28} style={{ color: 'var(--warning)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>View Reports & Analytics</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Course distribution & registration stats</div>
          </div>
        </Link>

        <Link href="/admin/notifications" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Bell size={28} style={{ color: 'var(--danger)' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>Send Notifications</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Publish announcements to student portal</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
