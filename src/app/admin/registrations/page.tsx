'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ClipboardList, Search, Calendar, User, BookOpen, CheckCircle, Clock } from 'lucide-react'

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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

  const handleUpdateRegistration = async (id: string, updates: any) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update registration status')

      toast.success('Registration application updated')
      fetchRegistrations()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = registrations.filter(r => 
    r.appNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.student?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.student?.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.exam?.examName?.toLowerCase().includes(search.toLowerCase()) ||
    r.exam?.examCode?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div>Loading registrations directory...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Manage Student Registrations</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review generated application numbers, payment verifications, and approval statuses.</p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '420px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by app no, candidate name, roll no, or exam..." 
          className="form-input" 
          style={{ paddingLeft: '2.5rem' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Registrations Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Application No.</th>
              <th style={{ padding: '1rem' }}>Candidate Name</th>
              <th style={{ padding: '1rem' }}>Roll Number</th>
              <th style={{ padding: '1rem' }}>Exam Name & Code</th>
              <th style={{ padding: '1rem' }}>Reg Date</th>
              <th style={{ padding: '1rem' }}>Payment Status</th>
              <th style={{ padding: '1rem' }}>Application Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                  {r.appNumber || `REG-2026-${r.id.slice(0, 5).toUpperCase()}`}
                </td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{r.student?.user?.name || 'Rahul Kumar'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600 }}>
                    {r.student?.rollNumber || 'CS2026001'}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>
                  <div>{r.exam?.examName || r.exam?.title}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.exam?.examCode || 'EXAM-101'}</span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(r.registeredAt).toLocaleDateString()}
                </td>

                <td style={{ padding: '1rem' }}>
                  <select 
                    value={r.paymentStatus || 'PAID'} 
                    onChange={(e) => handleUpdateRegistration(r.id, { paymentStatus: e.target.value })}
                    disabled={updatingId === r.id}
                    className="form-input"
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', width: 'auto', fontWeight: 600, color: r.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--warning)' }}
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="WAIVED">WAIVED</option>
                  </select>
                </td>

                <td style={{ padding: '1rem' }}>
                  <select 
                    value={r.appStatus || 'APPROVED'} 
                    onChange={(e) => handleUpdateRegistration(r.id, { appStatus: e.target.value, status: e.target.value === 'CANCELLED' ? 'CANCELLED' : 'REGISTERED' })}
                    disabled={updatingId === r.id}
                    className="form-input"
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem', width: 'auto', fontWeight: 600 }}
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No registration records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
