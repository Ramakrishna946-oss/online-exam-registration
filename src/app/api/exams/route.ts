import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function GET() {
  try {
    const rawExams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true, registrations: true, attempts: true }
        }
      }
    })

    const exams = rawExams.map(exam => ({
      ...exam,
      title: exam.examName
    }))

    return NextResponse.json({ exams })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      title, 
      examName, 
      examCode, 
      subject, 
      description, 
      duration, 
      status, 
      examFee, 
      eligibility, 
      examDate, 
      startTime, 
      regStartDate, 
      regEndDate 
    } = body

    const name = examName || title

    if (!name || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exam = await prisma.exam.create({
      data: {
        examName: name,
        examCode: examCode || `EXAM-${Math.floor(100 + Math.random() * 900)}`,
        subject: subject || 'General',
        description: description || '',
        duration: parseInt(duration),
        examFee: examFee ? parseInt(examFee) : 500,
        eligibility: eligibility || 'Minimum 60% aggregate',
        examDate: examDate ? new Date(examDate) : null,
        startTime: startTime || '10:00 AM',
        regStartDate: regStartDate ? new Date(regStartDate) : null,
        regEndDate: regEndDate ? new Date(regEndDate) : null,
        status: status || 'DRAFT'
      }
    })

    return NextResponse.json({ exam: { ...exam, title: exam.examName } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
