'use client'

import { useEffect, useState } from 'react'
import { FileText, CheckSquare, ClipboardList, User as UserIcon, Bell, Calendar, BookOpen, Clock, Building2, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState({
    availableExams: 0,
    registeredExams: 0,
    completedAttempts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(res => res.json()),
      fetch('/api/student/stats').then(res => res.json()),
      fetch('/api/notifications').then(res => res.json())
    ]).then(([userData, statsData, notifData]) => {
      if (userData?.user) setProfile(userData.user)
      if (statsData && !statsData.error) setStats(statsData)
      if (notifData?.notifications) setNotifications(notifData.notifications)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading student dashboard...</div>

  const studentInfo = profile?.student

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', background: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
            {studentInfo?.college || 'RK College of Engineering & Technology'}
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.5rem' }}>
            Welcome, {profile?.name || 'Student'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Online Exam Registration & Examination Control Dashboard</p>
        </div>

        <Link href="/dashboard/exams" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
          Browse & Register Exams
        </Link>
      </div>

      {/* Comprehensive Student Profile Card */}
      <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            {studentInfo?.photoUrl ? (
              <img src={studentInfo.photoUrl} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={36} />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', flex: 1 }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Roll Number</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)', fontFamily: 'monospace' }}>{studentInfo?.rollNumber || 'N/A'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course / Branch</div>
              <div style={{ fontWeight: 600 }}>{studentInfo?.course || 'B.Tech Computer Science'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</div>
              <div style={{ fontWeight: 600 }}>{studentInfo?.dob || '15 May 2003'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</div>
              <div style={{ fontWeight: 600 }}>{studentInfo?.gender || 'Male'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Phone</div>
              <div style={{ fontWeight: 600 }}>{studentInfo?.phone || '9876543210'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</div>
              <div style={{ fontWeight: 600 }}>{profile?.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#eff6ff', color: 'var(--primary)', borderRadius: '50%' }}>
            <FileText size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Available Exams</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.availableExams}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f5f3ff', color: '#8b5cf6', borderRadius: '50%' }}>
            <ClipboardList size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Registered Exams</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{stats.registeredExams}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f0fdf4', color: 'var(--success)', borderRadius: '50%' }}>
            <CheckSquare size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Application Status</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>Active & Verified</div>
          </div>
        </div>
      </div>

      {/* Notifications & Announcements Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Bell size={20} /> Official College Notifications & Announcements
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((n: any) => (
              <div key={n.id} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '0.5rem', borderLeft: `3px solid ${n.type === 'WARNING' ? 'var(--warning)' : 'var(--primary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{n.message}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                No active announcements at this time.
              </div>
            )}
          </div>
        </div>

        {/* Quick Links / Schedule Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: 'var(--primary)' }} /> Quick Navigation
          </h3>

          <Link href="/dashboard/exams" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '0.85rem 1rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Browse Exam Schedules</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View eligibility, dates & fees</div>
            </div>
            <FileText size={18} />
          </Link>

          <Link href="/dashboard/applications" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '0.85rem 1rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Application Slips & Status</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Download registration slips</div>
            </div>
            <ClipboardList size={18} />
          </Link>

          <Link href="/dashboard/results" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '0.85rem 1rem' }}>
            <div>
              <div style={{ fontWeight: 600 }}>View Performance & Results</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Check scorecards and grades</div>
            </div>
            <CheckSquare size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
