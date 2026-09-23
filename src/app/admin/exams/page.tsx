'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FileText, Plus, Edit, Trash2, HelpCircle, Clock, Calendar, Tag } from 'lucide-react'

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingExam, setEditingExam] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams')
      const data = await res.json()
      if (data.exams) setExams(data.exams)
    } catch {
      toast.error('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleSaveExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const examName = formData.get('examName') as string
    const examCode = formData.get('examCode') as string
    const subject = formData.get('subject') as string
    const duration = formData.get('duration') as string
    const examFee = formData.get('examFee') as string
    const eligibility = formData.get('eligibility') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string
    const examDate = formData.get('examDate') as string
    const startTime = formData.get('startTime') as string
    const regStartDate = formData.get('regStartDate') as string
    const regEndDate = formData.get('regEndDate') as string

    try {
      const isEdit = !!editingExam
      const url = isEdit ? `/api/exams/${editingExam.id}` : '/api/exams'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          examName, 
          examCode, 
          subject, 
          duration, 
          examFee, 
          eligibility, 
          description, 
          status, 
          examDate, 
          startTime, 
          regStartDate, 
          regEndDate 
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save exam')

      toast.success(isEdit ? 'Exam setup updated' : 'Examination setup created')
      setShowModal(false)
      setEditingExam(null)
      fetchExams()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam? All associated questions will also be deleted.')) return
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete exam')

      toast.success('Exam setup deleted')
      fetchExams()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <div>Loading examination schedules...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Manage Examinations</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure exam codes, schedules, registration fee, eligibility criteria, and question banks.</p>
        </div>
        
        <button onClick={() => { setEditingExam(null); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Create Examination Setup
        </button>
      </div>

      {/* Exam Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {exams.map(exam => (
          <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {exam.examCode || 'EXAM-101'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.35rem' }}>{exam.examName || exam.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subject: {exam.subject || 'Computer Science'}</div>
              </div>

              <span className={`badge ${exam.status === 'PUBLISHED' ? 'badge-success' : exam.status === 'CLOSED' ? 'badge-danger' : 'badge-primary'}`}>
                {exam.status}
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{exam.description || 'No description provided.'}</p>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div>Duration: <strong>{exam.duration} mins</strong></div>
              <div>Exam Fee: <strong style={{ color: 'var(--success)' }}>₹{exam.examFee || 500}</strong></div>
              <div>Exam Date: <strong>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'TBA'}</strong></div>
              <div>Reg Deadline: <strong>{exam.regEndDate ? new Date(exam.regEndDate).toLocaleDateString() : 'Open'}</strong></div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#1e40af', background: '#eff6ff', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
              <strong>Eligibility:</strong> {exam.eligibility || 'Open to course candidates'}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <Link href={`/admin/exams/${exam.id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>
                Questions ({exam._count?.questions || 0})
              </Link>
              <button 
                onClick={() => { setEditingExam(exam); setShowModal(true); }} 
                className="btn btn-outline"
                style={{ padding: '0.5rem' }}
                title="Edit Exam Setup"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => handleDeleteExam(exam.id)} 
                className="btn btn-outline"
                style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: '#fecaca' }}
                title="Delete Exam Setup"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Exam Setup Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem', overflowY: 'auto' }}>
          <div className="card" style={{ width: '100%', maxWidth: '640px', margin: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              {editingExam ? 'Edit Examination Setup' : 'Create New Examination Setup'}
            </h2>

            <form onSubmit={handleSaveExam}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Exam Name *</label>
                  <input type="text" name="examName" defaultValue={editingExam?.examName || editingExam?.title || ''} className="form-input" required placeholder="e.g. DBMS Semester Certification" />
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Code *</label>
                  <input type="text" name="examCode" defaultValue={editingExam?.examCode || 'DBMS-302'} className="form-input" required placeholder="DBMS-302" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" name="subject" defaultValue={editingExam?.subject || 'Computer Science'} className="form-input" placeholder="e.g. CSE" />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Mins) *</label>
                  <input type="number" name="duration" defaultValue={editingExam?.duration || 30} className="form-input" required min={1} />
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Fee (₹) *</label>
                  <input type="number" name="examFee" defaultValue={editingExam?.examFee || 500} className="form-input" required min={0} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Eligibility Criteria</label>
                <input type="text" name="eligibility" defaultValue={editingExam?.eligibility || 'Passed 1st Year with minimum 60% aggregate'} className="form-input" placeholder="Eligibility guidelines..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Scheduled Exam Date</label>
                  <input type="date" name="examDate" defaultValue={editingExam?.examDate ? new Date(editingExam.examDate).toISOString().split('T')[0] : '2026-09-28'} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="text" name="startTime" defaultValue={editingExam?.startTime || '02:00 PM'} className="form-input" placeholder="10:00 AM / 02:00 PM" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Reg Start Date</label>
                  <input type="date" name="regStartDate" defaultValue={editingExam?.regStartDate ? new Date(editingExam.regStartDate).toISOString().split('T')[0] : '2026-08-01'} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Reg Last Date</label>
                  <input type="date" name="regEndDate" defaultValue={editingExam?.regEndDate ? new Date(editingExam.regEndDate).toISOString().split('T')[0] : '2026-09-25'} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" defaultValue={editingExam?.description || ''} className="form-input" rows={2} placeholder="Provide exam objectives and rules..."></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Exam Status</label>
                <select name="status" defaultValue={editingExam?.status || 'PUBLISHED'} className="form-input">
                  <option value="DRAFT">DRAFT (Hidden from student catalog)</option>
                  <option value="PUBLISHED">PUBLISHED (Open for registration)</option>
                  <option value="CLOSED">CLOSED (Completed / Registration Ended)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingExam(null); }} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingExam ? 'Update Examination' : 'Save Examination Setup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
