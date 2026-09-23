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

    if (!student) {
      return NextResponse.json({ results: [] })
    }

    const rawResults = await prisma.result.findMany({
      where: {
        studentId: student.id
      },
      include: {
        exam: true,
        attempt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const results = rawResults.map(r => ({
      ...r,
      status: r.resultStatus,
      percentage: r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0,
      attempt: {
        ...r.attempt,
        exam: {
          ...r.exam,
          title: r.exam.examName,
          totalMarks: r.totalMarks
        }
      }
    }))

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
