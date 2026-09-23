'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle, XCircle, FileQuestion, Target } from 'lucide-react'

export default function ResultDetailsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/student/results/${attemptId}`)
      .then(res => res.json())
      .then(data => {
        if (data.result) setResult(data.result)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load result details')
        setLoading(false)
      })
  }, [attemptId])

  if (loading) return <div>Loading...</div>
  if (!result) return <div>Result not found</div>

  const { attempt } = result
  const { exam } = attempt
  const isPass = result.status === 'PASS'

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/dashboard/results" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }}/> Back to Results
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: isPass ? '#f0fdf4' : '#fef2f2',
          color: isPass ? 'var(--success)' : 'var(--danger)',
          marginBottom: '1rem'
        }}>
          {isPass ? <CheckCircle size={40} /> : <XCircle size={40} />}
        </div>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {isPass ? 'Congratulations!' : 'Keep Practicing!'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '2rem' }}>
          You scored <strong style={{ color: 'var(--text-main)' }}>{result.score}</strong> out of {exam.totalMarks} in {exam.title}.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Percentage</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{result.percentage.toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Correct</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)' }}>{result.correct}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Incorrect</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)' }}>{result.incorrect}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Unanswered</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--warning)' }}>{result.unanswered}</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/dashboard/exams" className="btn btn-primary">Browse More Exams</Link>
      </div>
    </div>
  )
}
