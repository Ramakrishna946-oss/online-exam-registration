'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Users, UserPlus, Search, Mail, Phone, BookOpen, GraduationCap, X } from 'lucide-react'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students')
      const data = await res.json()
      if (data.students) setStudents(data.students)
    } catch {
      toast.error('Failed to load students list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const rollNumber = formData.get('rollNumber') as string
    const course = formData.get('course') as string
    const phone = formData.get('phone') as string
    const dob = formData.get('dob') as string
    const gender = formData.get('gender') as string
    const college = formData.get('college') as string
    const address = formData.get('address') as string

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, rollNumber, course, phone, dob, gender, college, address })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add student')

      toast.success('Student candidate profile created successfully!')
      setShowModal(false)
      fetchStudents()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const filtered = students.filter(s => 
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.course?.toLowerCase().includes(search.toLowerCase()) ||
    s.college?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div>Loading students directory...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Student Management Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Registered candidates, academic records, roll numbers, and contact details.</p>
        </div>
        
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserPlus size={18} /> Register Candidate Profile
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '420px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by candidate name, email, roll no, or course..." 
          className="form-input" 
          style={{ paddingLeft: '2.5rem' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Candidate Name</th>
              <th style={{ padding: '1rem' }}>Roll Number</th>
              <th style={{ padding: '1rem' }}>Course / Branch</th>
              <th style={{ padding: '1rem' }}>Email & Phone</th>
              <th style={{ padding: '1rem' }}>College</th>
              <th style={{ padding: '1rem' }}>Registrations</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{s.user?.name || 'N/A'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600 }}>
                    {s.rollNumber}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{s.course || 'B.Tech CS'}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div>{s.user?.email}</div>
                  <div>{s.phone || '-'}</div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{s.college || 'RK College'}</td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-primary">{s._count?.registrations || 0} Exams</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => setSelectedStudent(s)} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}>
                    View Full Profile
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No student records match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem', overflowY: 'auto' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Register New Candidate Profile</h2>

            <form onSubmit={handleCreateStudent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="name" className="form-input" required placeholder="e.g. Ramesh Kumar" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" name="email" className="form-input" required placeholder="student@example.com" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="dob" className="form-input" defaultValue="2003-05-15" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-input" defaultValue="Male">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input type="text" name="rollNumber" className="form-input" required placeholder="CS2026045" />
                </div>
                <div className="form-group">
                  <label className="form-label">Course / Branch</label>
                  <input type="text" name="course" className="form-input" defaultValue="B.Tech Computer Science" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">College Name</label>
                <input type="text" name="college" className="form-input" defaultValue="RK College of Engineering & Technology" />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Phone</label>
                <input type="tel" name="phone" className="form-input" placeholder="9876543210" />
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" name="password" className="form-input" required minLength={6} placeholder="••••••••" />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Saving Profile...' : 'Save Candidate Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Student Profile View Modal */}
      {selectedStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', margin: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Student Candidate Profile</h3>
              <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedStudent.user?.name}</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>Roll No: {selectedStudent.rollNumber}</div>
              </div>

              <div><strong>Course:</strong> {selectedStudent.course || 'B.Tech Computer Science'}</div>
              <div><strong>College:</strong> {selectedStudent.college || 'RK College of Engineering & Technology'}</div>
              <div><strong>Email:</strong> {selectedStudent.user?.email}</div>
              <div><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</div>
              <div><strong>Date of Birth:</strong> {selectedStudent.dob || '15 May 2003'}</div>
              <div><strong>Gender:</strong> {selectedStudent.gender || 'Male'}</div>
              <div><strong>Address:</strong> {selectedStudent.address || 'N/A'}</div>
              <div><strong>Registered Date:</strong> {new Date(selectedStudent.createdAt).toLocaleDateString()}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedStudent(null)} className="btn btn-primary">Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
