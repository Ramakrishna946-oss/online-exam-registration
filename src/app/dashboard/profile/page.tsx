'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { User, Save } from 'lucide-react'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/student/profile')
      const data = await res.json()
      if (data.profile) setProfile(data.profile)
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const course = formData.get('course') as string
    const phone = formData.get('phone') as string

    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, course, phone })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')

      toast.success('Profile updated successfully!')
      fetchProfile()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading profile...</div>

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>My Student Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>View and update your personal and academic registration details.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" defaultValue={profile?.name || ''} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input type="email" value={profile?.email || ''} className="form-input" disabled style={{ background: '#f1f5f9' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Roll Number (Read-only)</label>
              <input type="text" value={profile?.student?.rollNumber || 'Not assigned'} className="form-input" disabled style={{ background: '#f1f5f9' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Course</label>
              <input type="text" name="course" defaultValue={profile?.student?.course || ''} className="form-input" placeholder="e.g. B.Tech Computer Science" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" name="phone" defaultValue={profile?.student?.phone || ''} className="form-input" placeholder="e.g. 9876543210" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
            {saving ? 'Saving Changes...' : <><Save size={18} /> Update Profile</>}
          </button>
        </form>
      </div>
    </div>
  )
}
