'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, HelpCircle, CheckCircle } from 'lucide-react'

export default function AdminManageQuestionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchExamAndQuestions = async () => {
    try {
      const [examRes, qRes] = await Promise.all([
        fetch(`/api/exams/${id}`).then(r => r.json()),
        fetch(`/api/exams/${id}/questions`).then(r => r.json())
      ])
      if (examRes.exam) setExam(examRes.exam)
      if (qRes.questions) setQuestions(qRes.questions)
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExamAndQuestions()
  }, [id])

  const handleSaveQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const questionText = formData.get('questionText') as string
    const optionA = formData.get('optionA') as string
    const optionB = formData.get('optionB') as string
    const optionC = formData.get('optionC') as string
    const optionD = formData.get('optionD') as string
    const correctAnswer = formData.get('correctAnswer') as string
    const marks = formData.get('marks') as string

    try {
      const isEdit = !!editingQuestion
      const url = isEdit 
        ? `/api/exams/${id}/questions/${editingQuestion.id}` 
        : `/api/exams/${id}/questions`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer,
          marks
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save question')

      toast.success(isEdit ? 'Question updated' : 'Question added')
      setShowModal(false)
      setEditingQuestion(null)
      fetchExamAndQuestions()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    try {
      const res = await fetch(`/api/exams/${id}/questions/${qId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete question')

      toast.success('Question deleted')
      fetchExamAndQuestions()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <div>Loading exam questions...</div>

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/exams" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>← Back to Manage Exams</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Question Bank: {exam?.examName || exam?.title}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Add and configure questions, multiple choice options, and marks.</p>
        </div>

        <button onClick={() => { setEditingQuestion(null); setShowModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Question
        </button>
      </div>

      {/* Questions List */}
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {questions.map((q, idx) => (
          <div key={q.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {idx + 1}. {q.questionText}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-primary">{q.marks} Marks</span>
                <button onClick={() => { setEditingQuestion(q); setShowModal(true); }} className="btn btn-outline" style={{ padding: '0.4rem' }}>
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDeleteQuestion(q.id)} className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: '#fecaca' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {[
                { key: 'A', text: q.optionA },
                { key: 'B', text: q.optionB },
                { key: 'C', text: q.optionC },
                { key: 'D', text: q.optionD }
              ].filter(opt => Boolean(opt.text)).map(opt => {
                const isCorrect = q.correctAnswer === opt.text || q.correctAnswer === opt.key
                return (
                  <div 
                    key={opt.key}
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: '0.5rem', 
                      border: isCorrect ? '2px solid var(--success)' : '1px solid var(--border)',
                      background: isCorrect ? '#f0fdf4' : 'var(--bg-color)',
                      fontWeight: isCorrect ? 600 : 400
                    }}
                  >
                    <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{opt.key}.</span> {opt.text}
                    {isCorrect && <CheckCircle size={16} style={{ color: 'var(--success)', float: 'right', marginTop: '0.2rem' }} />}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <HelpCircle size={44} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>No Questions Added Yet</h3>
            <p>Click "Add New Question" above to populate questions for this exam.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '1rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>

            <form onSubmit={handleSaveQuestion}>
              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea name="questionText" defaultValue={editingQuestion?.questionText || ''} className="form-input" rows={3} required placeholder="Enter question text..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Option A *</label>
                  <input type="text" name="optionA" defaultValue={editingQuestion?.optionA || ''} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Option B *</label>
                  <input type="text" name="optionB" defaultValue={editingQuestion?.optionB || ''} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Option C</label>
                  <input type="text" name="optionC" defaultValue={editingQuestion?.optionC || ''} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Option D</label>
                  <input type="text" name="optionD" defaultValue={editingQuestion?.optionD || ''} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Correct Answer *</label>
                  <input type="text" name="correctAnswer" defaultValue={editingQuestion?.correctAnswer || ''} className="form-input" required placeholder="Type exact text of correct option" />
                </div>
                <div className="form-group">
                  <label className="form-label">Marks *</label>
                  <input type="number" name="marks" defaultValue={editingQuestion?.marks || 10} className="form-input" required min={1} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingQuestion(null); }} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
