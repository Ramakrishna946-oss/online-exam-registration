import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = payload.id as string
    const examId = id

    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam || exam.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Exam is not available' }, { status: 400 })
    }

    let student = await prisma.student.findUnique({ where: { userId } })
    if (!student) {
      student = await prisma.student.create({
        data: {
          userId,
          rollNumber: `CS${Date.now().toString().slice(-6)}`,
          course: 'General'
        }
      })
    }

    let registration = await prisma.registration.findUnique({
      where: { studentId_examId: { studentId: student.id, examId } }
    })
    if (!registration) {
      registration = await prisma.registration.create({
        data: { studentId: student.id, examId }
      })
    }

    let attempt = await prisma.attempt.findUnique({
      where: { userId_examId: { userId, examId } }
    })

    if (attempt && attempt.status === 'COMPLETED') {
      return NextResponse.json({ error: 'You have already completed this exam' }, { status: 400 })
    }

    if (!attempt) {
      attempt = await prisma.attempt.create({
        data: { userId, studentId: student.id, examId }
      })
    }

    return NextResponse.json({ attemptId: attempt.id })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
