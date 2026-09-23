'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Bell, Send, Megaphone, AlertTriangle, Info, Plus } from 'lucide-react'

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.notifications) setNotifications(data.notifications)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleSendNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const message = formData.get('message') as string
    const type = formData.get('type') as string
    const target = formData.get('target') as string

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type, target })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send notification')

      toast.success('Notification broadcast published successfully!')
      setShowModal(false)
      fetchNotifications()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading notifications control panel...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Send Notifications & Announcements</h1>
          <p style={{ color: 'var(--text-muted)' }}>Publish official examination alerts, admit card notices, and academic announcements.</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Megaphone size={18} /> Publish New Announcement
        </button>
      </div>

      {/* Notifications History List */}
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {notifications.map(n => (
          <div key={n.id} className="card" style={{ borderLeft: `4px solid ${n.type === 'WARNING' ? 'var(--warning)' : n.type === 'URGENT' ? 'var(--danger)' : 'var(--primary)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${n.type === 'WARNING' ? 'badge-danger' : 'badge-primary'}`}>
                  {n.type}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{n.title}</h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{n.message}</p>
            
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Target Audience: <strong>{n.target === 'ALL' ? 'All Registered Candidates & Staff' : 'Registered Students Only'}</strong>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            No announcements have been published yet.
          </div>
        )}
      </div>

      {/* Publish Notification Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', margin: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>Broadcast New Announcement</h2>

            <form onSubmit={handleSendNotification}>
              <div className="form-group">
                <label className="form-label">Announcement Title *</label>
                <input type="text" name="title" className="form-input" required placeholder="e.g. Exam Schedule Released for DBMS-302" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category / Urgency</label>
                  <select name="type" className="form-input" defaultValue="ANNOUNCEMENT">
                    <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">IMPORTANT WARNING</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select name="target" className="form-input" defaultValue="ALL">
                    <option value="ALL">All Portal Users</option>
                    <option value="STUDENT">Students Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Details / Message *</label>
                <textarea name="message" className="form-input" rows={4} required placeholder="Write announcement details here..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Publishing...' : <><Send size={16} /> Broadcast Notification</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
