'use client'

import { useState, useEffect } from 'react'
import { Clock, FileText, Calendar, BookOpen, CheckCircle, Tag, AlertCircle, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AvailableExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [registering, setRegistering] = useState(false)
  const [successModal, setSuccessModal] = useState<any>(null)

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/student/exams')
      const data = await res.json()
      if (data.exams) setExams(data.exams)
    } catch {
      toast.error('Failed to load available exams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const handleConfirmRegister = async () => {
    if (!selectedExam) return
    setRegistering(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: selectedExam.id })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      toast.success('Successfully registered for examination!')
      setSuccessModal(data.registration)
      setSelectedExam(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRegistering(false)
    }
  }

  if (loading) return <div>Loading available examinations...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Exam Registration Portal</h1>
        <p style={{ color: 'var(--text-muted)' }}>Browse available semester assessments, eligibility criteria, exam fees, and register online.</p>
      </div>

      {/* Exam Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {exams.map(exam => (
          <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--primary)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: '#eff6ff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {exam.examCode || 'EXAM-101'}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>
                  Fee: ₹{exam.examFee || 500}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{exam.examName || exam.title}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Subject: {exam.subject || 'General Studies'}</div>
            </div>

            {exam.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{exam.description}</p>}

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Exam Date:</span><br />
                <strong>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'TBA'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Last Reg Date:</span><br />
                <strong>{exam.regEndDate ? new Date(exam.regEndDate).toLocaleDateString() : 'Open'}</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#1e40af', background: '#eff6ff', padding: '0.5rem 0.75rem', borderRadius: '0.375rem' }}>
              <strong>Eligibility:</strong> {exam.eligibility || 'Open to all course students'}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <Link href={`/dashboard/exams/${exam.id}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem' }}>
                View Instructions
              </Link>
              <button 
                onClick={() => setSelectedExam(exam)}
                className="btn btn-primary"
                style={{ flex: 1, fontSize: '0.9rem' }}
              >
                Register Now
              </button>
            </div>
          </div>
        ))}
        {exams.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            No exams are currently open for registration.
          </div>
        )}
      </div>

      {/* Registration Confirmation Modal */}
      {selectedExam && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>Confirm Exam Registration</h3>
              <button onClick={() => setSelectedExam(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedExam.examName || selectedExam.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Exam Code: <strong>{selectedExam.examCode || 'EXAM-101'}</strong></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Exam Date: <strong>{selectedExam.examDate ? new Date(selectedExam.examDate).toLocaleDateString() : 'TBA'} ({selectedExam.startTime || '10:00 AM'})</strong></div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Exam Fee: <strong style={{ color: 'var(--success)' }}>₹{selectedExam.examFee || 500}</strong> (Included in Semester Fee)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Eligibility: <strong>{selectedExam.eligibility || 'Eligible'}</strong></div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              By clicking "Confirm Registration", an official Application Number will be generated for your registration slip.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedExam(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleConfirmRegister} className="btn btn-primary" disabled={registering}>
                {registering ? 'Generating Application...' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Success Modal */}
      {successModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ color: 'var(--success)', margin: '0 auto 1rem', background: '#f0fdf4', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={44} />
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Registration Successful!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your examination application has been registered successfully.</p>

            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px dashed var(--primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Generated Application Number</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                {successModal.appNumber || 'REG-2026-84920'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link href="/dashboard/applications" className="btn btn-primary" onClick={() => setSuccessModal(null)}>
                View Application Slips <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
