'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, ChevronLeft, ChevronRight, Flag, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExamInterface({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params)
  const [attempt, setAttempt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  
  // Maps questionId -> string
  const [answers, setAnswers] = useState<Record<string, string>>({})
  // Maps questionId -> boolean
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({})
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAttempt = async () => {
    try {
      const res = await fetch(`/api/exam/${attemptId}`)
      const data = await res.json()
      
      if (data.completed || data.timeExpired) {
        toast('Exam is already completed or time expired.')
        router.push('/dashboard/results')
        return
      }

      if (data.attempt) {
        setAttempt(data.attempt)
        
        // Restore existing answers
        const savedAnswers: Record<string, string> = {}
        data.attempt.answers.forEach((ans: any) => {
          savedAnswers[ans.questionId] = ans.selectedAnswer
        })
        setAnswers(savedAnswers)

        // Calculate time left
        const start = new Date(data.attempt.startedAt).getTime()
        const duration = data.attempt.exam.duration * 60 * 1000
        const end = start + duration
        const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000))
        setTimeLeft(remaining)
      }
    } catch (err) {
      toast.error('Failed to load exam')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttempt()
  }, [])

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            clearInterval(timerRef.current!)
            handleAutoSubmit()
            return 0
          }
          return prev ? prev - 1 : 0
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timeLeft, submitting])

  const handleAutoSubmit = async () => {
    toast('Time is up! Submitting exam automatically.')
    await submitExam()
  }

  const saveAnswer = async (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    
    // Fire and forget save
    fetch(`/api/exam/${attemptId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_ANSWER', questionId, selectedAnswer: answer })
    }).catch(console.error)
  }

  const submitExam = async () => {
    setSubmitting(true)
    setShowSubmitConfirm(false)
    try {
      const res = await fetch(`/api/exam/${attemptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUBMIT_EXAM' })
      })
      if (!res.ok) throw new Error('Failed to submit exam')
      
      toast.success('Exam submitted successfully')
      router.push(`/dashboard/results/${attemptId}`)
    } catch (err) {
      toast.error('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading exam environment...</div>
  if (!attempt || !attempt.exam) return <div>Exam not found</div>

  const questions = attempt.exam.questions
  const currentQ = questions[currentQIndex]
  const currentOptions = JSON.parse(currentQ.options)

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const toggleReview = () => {
    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }))
  }

  const answeredCount = Object.keys(answers).length
  const reviewCount = Object.values(markedForReview).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{attempt.exam.title}</h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Candidate ID: {attempt.userId.split('-')[0]}</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '1.25rem', 
            fontWeight: 700,
            color: timeLeft !== null && timeLeft < 300 ? 'var(--danger)' : 'var(--text-main)',
            padding: '0.5rem 1rem',
            background: timeLeft !== null && timeLeft < 300 ? '#fef2f2' : '#f1f5f9',
            borderRadius: '0.5rem'
          }}>
            <Clock />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left: Question Area */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Question {currentQIndex + 1} of {questions.length}</h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Marks: {currentQ.marks}</div>
            </div>
            
            <div style={{ fontSize: '1.125rem', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
              {currentQ.questionText}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              {currentOptions.map((opt: string, idx: number) => {
                const isSelected = answers[currentQ.id] === opt
                return (
                  <label 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '1rem', 
                      padding: '1rem', 
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name={`q-${currentQ.id}`} 
                      value={opt}
                      checked={isSelected}
                      onChange={() => saveAnswer(currentQ.id, opt)}
                      style={{ marginTop: '0.25rem', width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '1rem' }}>{opt}</span>
                  </label>
                )
              })}
            </div>

            {/* Navigation Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <button 
                className="btn btn-outline" 
                onClick={toggleReview}
                style={{ color: markedForReview[currentQ.id] ? 'var(--warning)' : 'inherit', borderColor: markedForReview[currentQ.id] ? 'var(--warning)' : 'var(--border)' }}
              >
                <Flag size={18} /> {markedForReview[currentQ.id] ? 'Unmark Review' : 'Mark for Review'}
              </button>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQIndex === questions.length - 1}
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Palette */}
        <div style={{ width: '320px', background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Question Palette</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success)' }}></div> Answered: {answeredCount}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--border)' }}></div> Unanswered: {questions.length - answeredCount}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)' }}></div> Review: {reviewCount}
              </div>
            </div>
          </div>
          
          <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', alignContent: 'start' }}>
            {questions.map((q: any, i: number) => {
              const isAnswered = !!answers[q.id]
              const isMarked = !!markedForReview[q.id]
              const isCurrent = i === currentQIndex

              let bg = 'transparent'
              let color = 'var(--text-main)'
              let border = '1px solid var(--border)'

              if (isCurrent) {
                border = '2px solid var(--primary)'
              }

              if (isMarked) {
                bg = 'var(--warning)'
                color = 'white'
                border = 'none'
              } else if (isAnswered) {
                bg = 'var(--success)'
                color = 'white'
                border = 'none'
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(i)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '0.25rem',
                    background: bg,
                    color: color,
                    border: border,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {i + 1}
                  {isAnswered && isMarked && (
                    <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--success)', width: 8, height: 8, borderRadius: '50%', border: '1px solid white' }}></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Submit Exam?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to submit your exam? You have answered {answeredCount} out of {questions.length} questions.
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowSubmitConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitExam}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
