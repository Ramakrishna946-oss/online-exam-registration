import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function GET(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rawResult = await prisma.result.findUnique({
      where: { attemptId },
      include: {
        exam: {
          include: {
            questions: true
          }
        },
        attempt: {
          include: {
            answers: true
          }
        }
      }
    })

    if (!rawResult || (rawResult.attempt && rawResult.attempt.userId !== payload.id)) {
      return NextResponse.json({ error: 'Result not found or unauthorized' }, { status: 404 })
    }

    const answers = rawResult.attempt?.answers || []
    const correctCount = answers.filter(a => a.isCorrect).length
    const incorrectCount = answers.filter(a => !a.isCorrect && a.selectedAnswer).length
    const unansweredCount = (rawResult.exam?.questions?.length || 0) - answers.length

    const result = {
      ...rawResult,
      status: rawResult.resultStatus,
      percentage: rawResult.totalMarks > 0 ? (rawResult.score / rawResult.totalMarks) * 100 : 0,
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: Math.max(0, unansweredCount),
      attempt: {
        ...rawResult.attempt,
        exam: {
          ...rawResult.exam,
          title: rawResult.exam?.examName,
          totalMarks: rawResult.totalMarks
        }
      }
    }

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
