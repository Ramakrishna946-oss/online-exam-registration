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

    const role = payload.role as string
    const userId = payload.id as string

    if (role === 'ADMIN') {
      const results = await prisma.result.findMany({
        include: {
          student: {
            include: { user: { select: { name: true, email: true } } }
          },
          exam: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json({ results })
    }

    const student = await prisma.student.findUnique({ where: { userId } })
    if (!student) {
      return NextResponse.json({ results: [] })
    }

    const results = await prisma.result.findMany({
      where: { studentId: student.id },
      include: {
        exam: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ results })
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
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { examId, studentId, score, totalMarks, resultStatus, attemptId } = body

    if (!examId || score === undefined || totalMarks === undefined) {
      return NextResponse.json({ error: 'Missing required result fields (examId, score, totalMarks)' }, { status: 400 })
    }

    let targetStudentId = studentId
    if (!targetStudentId) {
      const student = await prisma.student.findUnique({ where: { userId: payload.id as string } })
      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
      }
      targetStudentId = student.id
    }

    const passingScore = Math.ceil(totalMarks * 0.4)
    const status = resultStatus || (score >= passingScore ? 'PASS' : 'FAIL')

    const result = await prisma.result.create({
      data: {
        studentId: targetStudentId,
        examId,
        attemptId: attemptId || null,
        score: parseInt(score),
        totalMarks: parseInt(totalMarks),
        resultStatus: status
      },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        exam: true
      }
    })

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
