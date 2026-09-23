import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rawExam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: true
      }
    })
    
    if (!rawExam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 })

    const totalMarks = rawExam.questions.reduce((acc, q) => acc + q.marks, 0)
    
    const formattedQuestions = rawExam.questions.map(q => ({
      ...q,
      options: JSON.stringify([q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean))
    }))

    const exam = {
      ...rawExam,
      title: rawExam.examName,
      totalMarks,
      passingMarks: Math.ceil(totalMarks * 0.4),
      questions: formattedQuestions
    }

    return NextResponse.json({ exam })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      examName, 
      title, 
      examCode, 
      subject, 
      duration, 
      description, 
      status, 
      examFee, 
      eligibility, 
      examDate, 
      startTime, 
      regStartDate, 
      regEndDate 
    } = body

    const name = examName || title

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        ...(name && { examName: name }),
        ...(examCode && { examCode }),
        ...(subject && { subject }),
        ...(duration && { duration: parseInt(duration) }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(examFee !== undefined && { examFee: parseInt(examFee) }),
        ...(eligibility !== undefined && { eligibility }),
        ...(examDate && { examDate: new Date(examDate) }),
        ...(startTime && { startTime }),
        ...(regStartDate && { regStartDate: new Date(regStartDate) }),
        ...(regEndDate && { regEndDate: new Date(regEndDate) })
      }
    })

    return NextResponse.json({ exam: { ...updatedExam, title: updatedExam.examName } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    await prisma.exam.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Exam deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
