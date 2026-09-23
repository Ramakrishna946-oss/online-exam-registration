'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { GraduationCap, UserPlus, Upload, Image as ImageIcon } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const name = (formData.get('name') as string || '').trim()
    const email = (formData.get('email') as string || '').trim().toLowerCase()
    const dob = formData.get('dob') as string
    const gender = formData.get('gender') as string
    const phone = (formData.get('phone') as string || '').trim()
    const college = (formData.get('college') as string || '').trim()
    const course = (formData.get('course') as string || '').trim()
    const rollNumber = (formData.get('rollNumber') as string || '').trim()
    const address = (formData.get('address') as string || '').trim()
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address (e.g. candidate@example.com)')
      setLoading(false)
      return
    }

    if (password !== confirm) {
      toast.error('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          dob,
          gender,
          phone,
          college: college || 'RK College of Engineering & Technology',
          course: course || 'B.Tech Computer Science',
          rollNumber,
          address,
          photoUrl: photoPreview || null
        })
      })
      
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Registration successful! Welcome to RK College Exam Portal.')
      router.push(data.user?.role === 'ADMIN' ? '/admin' : '/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <div className="card" style={{ maxWidth: '780px', margin: '0 auto', borderTop: '5px solid var(--primary)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem', background: '#eff6ff', color: 'var(--primary)', borderRadius: '50%' }}>
            <GraduationCap size={36} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Student Online Exam Registration Form</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>RK College Examination Control & Candidate Registration System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Personal Information */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1rem' }}>
            1. Candidate Personal Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Full Candidate Name *</label>
              <input type="text" name="name" className="form-input" required placeholder="e.g. Ramesh Kumar Sharma" />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" name="dob" className="form-input" required defaultValue="2003-06-15" />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select name="gender" className="form-input" required defaultValue="Male">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Registered Email Address *</label>
              <input type="email" name="email" className="form-input" required placeholder="ramesh@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input type="tel" name="phone" className="form-input" required placeholder="e.g. 9876543210" />
            </div>
          </div>

          {/* Section 2: College & Academic Details */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '1rem' }}>
            2. College & Academic Information
          </h3>

          <div className="form-group">
            <label className="form-label">College Name *</label>
            <input 
              type="text" 
              name="college" 
              className="form-input" 
              required 
              defaultValue="RK College of Engineering & Technology" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Course / Branch *</label>
              <select name="course" className="form-input" required defaultValue="B.Tech Computer Science">
                <option value="B.Tech Computer Science">B.Tech Computer Science (CSE)</option>
                <option value="B.Tech Information Technology">B.Tech Information Technology (IT)</option>
                <option value="B.Tech Electronics & Comm">B.Tech Electronics & Comm (ECE)</option>
                <option value="B.Tech Mechanical Engineering">B.Tech Mechanical Engineering</option>
                <option value="MCA Computer Applications">MCA Computer Applications</option>
                <option value="MBA Business Administration">MBA Business Administration</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Roll / Registration Number *</label>
              <input type="text" name="rollNumber" className="form-input" required placeholder="e.g. CS2026045" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea name="address" className="form-input" rows={2} placeholder="Street, City, State, Pincode" />
          </div>

          {/* Section 3: Photo Upload & Security */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '1rem' }}>
            3. Profile Photo & Security Credentials
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Candidate Preview" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', border: '3px solid var(--primary)' }} />
              ) : (
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--text-muted)' }}>
                  <ImageIcon size={40} />
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Upload Profile Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="form-input" style={{ background: 'white' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                Allowed formats: JPG, PNG. Max file size: 2MB.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" name="password" className="form-input" required minLength={6} placeholder="••••••••" />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" name="confirm" className="form-input" required minLength={6} placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem', fontSize: '1.05rem' }} disabled={loading}>
            {loading ? 'Submitting Registration...' : <><UserPlus size={20} /> Submit Student Registration</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Already registered? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login to Portal</Link>
        </div>
      </div>
    </div>
  )
}
