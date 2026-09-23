'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FileText, Calendar, CheckCircle, XCircle, Award } from 'lucide-react'

export default function MyResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        if (data.results) setResults(data.results)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load results')
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading results...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>My Exam Results</h1>
        <p style={{ color: 'var(--text-muted)' }}>Evaluated scores, total marks, and pass/fail status performance records.</p>
      </div>
      
      {results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <Award size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Exam Results Yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>You have not completed any evaluated examinations yet.</p>
          <Link href="/dashboard/exams" className="btn btn-primary">Browse Available Exams</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {results.map(result => {
            const isPass = result.resultStatus === 'PASS' || result.status === 'PASS'
            return (
              <div key={result.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{result.exam?.examName || result.exam?.title || 'Examination'}</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> Date: {new Date(result.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FileText size={14} /> Score: <strong>{result.score}</strong> / {result.totalMarks}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isPass ? 'var(--success)' : 'var(--danger)' }}>
                      {result.percentage?.toFixed(1) || ((result.score / result.totalMarks) * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ 
                    padding: '0.5rem 1.25rem', 
                    borderRadius: '2rem', 
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: isPass ? '#f0fdf4' : '#fef2f2',
                    color: isPass ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {isPass ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    {isPass ? 'PASS' : 'FAIL'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
