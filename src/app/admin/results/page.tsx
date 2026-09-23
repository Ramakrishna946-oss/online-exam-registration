'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { CheckSquare, Search, Award, CheckCircle, XCircle } from 'lucide-react'

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

  const filtered = results.filter(r => 
    r.student?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.student?.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.exam?.examName?.toLowerCase().includes(search.toLowerCase()) ||
    r.exam?.title?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div>Loading results...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Manage Results</h1>
        <p style={{ color: 'var(--text-muted)' }}>Evaluated student performance records and pass/fail grading audit log.</p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by student name, roll number, or exam..." 
          className="form-input" 
          style={{ paddingLeft: '2.5rem' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Results Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Candidate Name</th>
              <th style={{ padding: '1rem' }}>Roll Number</th>
              <th style={{ padding: '1rem' }}>Exam Name</th>
              <th style={{ padding: '1rem' }}>Score</th>
              <th style={{ padding: '1rem' }}>Percentage</th>
              <th style={{ padding: '1rem' }}>Result Status</th>
              <th style={{ padding: '1rem' }}>Evaluation Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const isPass = r.resultStatus === 'PASS' || r.status === 'PASS'
              const percentage = r.totalMarks > 0 ? ((r.score / r.totalMarks) * 100).toFixed(1) : '0'
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{r.student?.user?.name || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600 }}>
                      {r.student?.rollNumber || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{r.exam?.examName || r.exam?.title}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>
                    {r.score} / {r.totalMarks}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: isPass ? 'var(--success)' : 'var(--danger)' }}>
                    {percentage}%
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${isPass ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {isPass ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {isPass ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No result records found matching your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
