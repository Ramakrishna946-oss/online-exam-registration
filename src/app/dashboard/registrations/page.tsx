'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ClipboardList, Calendar, Clock, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react'

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/registrations')
      const data = await res.json()
      if (data.registrations) setRegistrations(data.registrations)
    } catch {
      toast.error('Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const handleCancelRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel registration')

      toast.success('Registration cancelled')
      fetchRegistrations()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <div>Loading my registrations...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>My Exam Registrations</h1>
        <p style={{ color: 'var(--text-muted)' }}>View your active exam enrollments and registration history.</p>
      </div>

      {registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Exam Registrations Found</h3>
          <p style={{ marginBottom: '1.5rem' }}>You have not enrolled in any examinations yet.</p>
          <Link href="/dashboard/exams" className="btn btn-primary">Browse Available Exams</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {registrations.map(reg => (
            <div key={reg.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '0.35rem' }}>
                  {reg.exam?.subject || 'General'}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{reg.exam?.examName || reg.exam?.title}</h3>
                
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} /> Registered: {new Date(reg.registeredAt).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> Duration: {reg.exam?.duration} mins
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`badge ${reg.status === 'REGISTERED' ? 'badge-success' : 'badge-danger'}`}>
                  {reg.status}
                </span>

                <Link href={`/dashboard/exams/${reg.examId}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  View Exam
                </Link>

                {reg.status === 'REGISTERED' && (
                  <button 
                    onClick={() => handleCancelRegistration(reg.id)} 
                    className="btn btn-outline"
                    style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: '#fecaca' }}
                    title="Cancel Registration"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
