import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = payload.id as string
    const student = await prisma.student.findUnique({ where: { userId } })
    const studentId = student ? student.id : ''

    const [availableExams, registeredExams, completedAttempts] = await Promise.all([
      prisma.exam.count({ where: { status: 'PUBLISHED' } }),
      studentId ? prisma.registration.count({ where: { studentId, status: 'REGISTERED' } }) : 0,
      prisma.attempt.count({ where: { userId, status: 'COMPLETED' } })
    ])

    return NextResponse.json({
      availableExams,
      registeredExams,
      completedAttempts
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
