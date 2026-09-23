'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { ClipboardList, Download, Printer, CheckCircle, Clock, GraduationCap, X, FileText, Calendar, Building2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function StudentApplicationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlip, setSelectedSlip] = useState<any>(null)

  useEffect(() => {
    fetch('/api/registrations')
      .then(res => res.json())
      .then(data => {
        if (data.registrations) setRegistrations(data.registrations)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load application status')
        setLoading(false)
      })
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div>Loading application status records...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Application Status & Download Slips</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track official application numbers, payment confirmation, approval status, and print registration slips.</p>
      </div>

      {registrations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Submitted Applications</h3>
          <p style={{ marginBottom: '1.5rem' }}>You have not submitted any exam registration applications yet.</p>
          <Link href="/dashboard/exams" className="btn btn-primary">Browse & Register Exams</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {registrations.map(reg => (
            <div key={reg.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', background: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                    {reg.appNumber || `REG-2026-${reg.id.slice(0, 5).toUpperCase()}`}
                  </span>
                  <span className={`badge ${reg.appStatus === 'APPROVED' ? 'badge-success' : 'badge-primary'}`}>
                    {reg.appStatus || 'APPROVED'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  {reg.exam?.examName || reg.exam?.title}
                </h3>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span>Code: <strong>{reg.exam?.examCode || 'EXAM-101'}</strong></span>
                  <span>Registered: <strong>{new Date(reg.registeredAt).toLocaleDateString()}</strong></span>
                  <span>Fee Payment: <strong style={{ color: 'var(--success)' }}>{reg.paymentStatus || 'PAID'}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button 
                  onClick={() => setSelectedSlip(reg)} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                >
                  <Download size={16} /> Download Application Slip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Application Slip Modal */}
      {selectedSlip && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem', overflowY: 'auto' }}>
          <div className="card" style={{ width: '100%', maxWidth: '680px', background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            
            {/* Modal Controls (Hidden in Print) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Official Registration Slip Preview</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button onClick={() => setSelectedSlip(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Application Slip Content */}
            <div id="printable-slip" style={{ border: '2px solid #1e3a8a', padding: '1.75rem', background: '#ffffff', borderRadius: '0.25rem' }}>
              
              {/* Header */}
              <div style={{ textTransform: 'uppercase', textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>RK College of Engineering & Technology</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Office of Controller of Examinations</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Accredited Grade A Institution • Autonomous College Campus</div>
                <div style={{ display: 'inline-block', background: '#1e3a8a', color: 'white', padding: '0.2rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem' }}>
                  Official Candidate Application Slip - Fall 2026
                </div>
              </div>

              {/* Application Barcode & App Number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Application Number</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                    {selectedSlip.appNumber || `REG-2026-${selectedSlip.id.slice(0, 5).toUpperCase()}`}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status & Payment</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)' }}>
                    {selectedSlip.appStatus || 'APPROVED'} ({selectedSlip.paymentStatus || 'PAID'})
                  </div>
                </div>
              </div>

              {/* Student Details Grid */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569', width: '35%' }}>Student Candidate Name:</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{selectedSlip.student?.user?.name || 'Rahul Kumar'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>Roll / Reg Number:</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600, fontFamily: 'monospace' }}>{selectedSlip.student?.rollNumber || 'CS2026001'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>Course / Branch:</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{selectedSlip.student?.course || 'B.Tech Computer Science'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>Examination Name:</td>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedSlip.exam?.examName || selectedSlip.exam?.title}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>Exam Code & Subject:</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{selectedSlip.exam?.examCode || 'EXAM-101'} - {selectedSlip.exam?.subject || 'General'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>Scheduled Exam Date:</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{selectedSlip.exam?.examDate ? new Date(selectedSlip.exam.examDate).toLocaleDateString() : 'TBA'} ({selectedSlip.exam?.startTime || '10:00 AM'})</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', fontWeight: 700, color: '#475569' }}>Registration Date:</td>
                    <td style={{ padding: '0.5rem', fontWeight: 600 }}>{new Date(selectedSlip.registeredAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #475569', width: '140px', paddingTop: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    Candidate Signature
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.25rem' }}>Dr. S. K. Sharma</div>
                  <div style={{ borderTop: '1px solid #475569', width: '160px', paddingTop: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    Controller of Examinations
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
