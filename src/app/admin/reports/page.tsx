'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { BarChart3, Printer, FileText, Users, CheckCircle, Award, Building2 } from 'lucide-react'

export default function AdminReportsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/students').then(r => r.json()),
      fetch('/api/exams').then(r => r.json()),
      fetch('/api/registrations').then(r => r.json()),
      fetch('/api/results').then(r => r.json())
    ]).then(([sData, eData, regData, resData]) => {
      if (sData.students) setStudents(sData.students)
      if (eData.exams) setExams(eData.exams)
      if (regData.registrations) setRegistrations(regData.registrations)
      if (resData.results) setResults(resData.results)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div>Loading academic reports & statistics...</div>

  // Calculate summary metrics
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.exam?.examFee || 500), 0)
  const passCount = results.filter(r => r.resultStatus === 'PASS' || r.status === 'PASS').length
  const failCount = results.filter(r => r.resultStatus === 'FAIL' || r.status === 'FAIL').length
  const passPercentage = results.length > 0 ? ((passCount / results.length) * 100).toFixed(1) : '100'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Academic Reports & Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Official examination registration analytics, course distribution, and result performance reports.</p>
        </div>
        
        <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Printer size={18} /> Print Official Summary Report
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Registered Candidates</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.25rem' }}>{students.length}</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Active Examinations</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.25rem' }}>{exams.length}</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Exam Applications</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.25rem' }}>{registrations.length}</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Exam Fee Collection</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--success)' }}>₹{totalRevenue}</div>
        </div>
      </div>

      {/* Printable Report Section */}
      <div className="card" id="printable-report" style={{ borderTop: '4px solid var(--primary)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>RK COLLEGE OF ENGINEERING & TECHNOLOGY</h2>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>OFFICE OF CONTROLLER OF EXAMINATIONS</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official Semester Examination Report — Academic Session 2026</div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          1. Examination Registration Breakdown
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)', fontSize: '0.85rem' }}>
              <th style={{ padding: '0.75rem' }}>Exam Name & Code</th>
              <th style={{ padding: '0.75rem' }}>Subject</th>
              <th style={{ padding: '0.75rem' }}>Exam Date</th>
              <th style={{ padding: '0.75rem' }}>Exam Fee</th>
              <th style={{ padding: '0.75rem' }}>Total Registrations</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => {
              const regCount = registrations.filter(r => r.examId === exam.id).length
              return (
                <tr key={exam.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                    {exam.examName || exam.title} <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>({exam.examCode || 'EXAM-101'})</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{exam.subject}</td>
                  <td style={{ padding: '0.75rem' }}>{exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'TBA'}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>₹{exam.examFee || 500}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{regCount} Candidates</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          2. Candidate Performance & Pass/Fail Metrics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Evaluated Attempts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{results.length}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Successful Passes</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{passCount}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unsuccessful Attempts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)' }}>{failCount}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pass Percentage</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{passPercentage}%</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Report Generated On: {new Date().toLocaleString()}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Administrator Logged In</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Dr. S. K. Sharma</div>
            <div style={{ borderTop: '1px solid var(--text-main)', width: '160px', paddingTop: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
              Controller of Examinations
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
