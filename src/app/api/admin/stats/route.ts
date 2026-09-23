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
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [totalStudents, totalExams, activeExams, completedAttempts] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.exam.count(),
      prisma.exam.count({ where: { status: 'PUBLISHED' } }),
      prisma.attempt.count({ where: { status: 'COMPLETED' } })
    ])

    return NextResponse.json({
      totalStudents,
      totalExams,
      activeExams,
      completedAttempts
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
