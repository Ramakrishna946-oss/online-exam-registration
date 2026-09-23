'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, FileText, CheckCircle, AlertTriangle, Calendar, BookOpen, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [exam, setExam] = useState<any>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [starting, setStarting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch(`/api/exams/${id}`).then(res => res.json()),
      fetch('/api/registrations').then(res => res.json())
    ]).then(([examData, regData]) => {
      if (examData.exam) setExam(examData.exam)
      if (regData.registrations) {
        const found = regData.registrations.some((r: any) => r.examId === id && r.status === 'REGISTERED')
        setIsRegistered(found)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleRegister = async () => {
    setRegistering(true)
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: id })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      toast.success('Successfully registered for this exam!')
      setIsRegistered(true)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRegistering(false)
    }
  }

  const handleStartExam = async () => {
    if (!agreed) return
    setStarting(true)
    try {
      const res = await fetch(`/api/student/exams/${id}/start`, { method: 'POST' })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to start exam')
      
      router.push(`/exam/${data.attemptId}`)
    } catch (err: any) {
      toast.error(err.message)
      setStarting(false)
    }
  }

  if (loading) return <div>Loading exam details...</div>
  if (!exam) return <div>Exam not found</div>

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/dashboard/exams" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>← Back to Available Exams</Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: '#eff6ff', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
              {exam.subject || 'General'}
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem' }}>{exam.examName || exam.title}</h1>
          </div>

          {isRegistered ? (
            <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Check size={16} /> Registered
            </span>
          ) : (
            <button 
              onClick={handleRegister} 
              disabled={registering}
              className="btn btn-primary" 
              style={{ fontSize: '1rem', padding: '0.6rem 1.5rem' }}
            >
              {registering ? 'Registering...' : 'Register for Exam'}
            </button>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: 1.6 }}>{exam.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', background: 'var(--bg-color)', padding: '1.25rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Duration</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}><Clock size={18} /> {exam.duration} mins</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Questions</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}><FileText size={18} /> {exam.questions?.length || 0}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Marks</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}><CheckCircle size={18} /> {exam.totalMarks || 0}</div>
          </div>
          {exam.examDate && (
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Exam Schedule</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}><Calendar size={18} /> {new Date(exam.examDate).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {/* Exam Taking Section */}
        {isRegistered && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
              <AlertTriangle size={20} /> Candidate Instructions & Rules
            </h3>
            
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              <li>The exam timer starts as soon as you click "START EXAM".</li>
              <li>You can navigate back and forth between questions and mark questions for review.</li>
              <li>Your answers are saved automatically in real-time.</li>
              <li>The test will auto-submit when the duration timer expires.</li>
            </ul>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 500 }}>I confirm that I have read and agree to all exam instructions.</span>
              </label>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', maxWidth: '320px', fontSize: '1.1rem', padding: '0.75rem' }}
                disabled={!agreed || starting}
                onClick={handleStartExam}
              >
                {starting ? 'Starting Test...' : 'START EXAM NOW'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
