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
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rawAttempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: true
          }
        },
        answers: true
      }
    })

    if (!rawAttempt || rawAttempt.userId !== payload.id) {
      return NextResponse.json({ error: 'Attempt not found or unauthorized' }, { status: 404 })
    }

    if (rawAttempt.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Exam already completed', completed: true })
    }

    const startTime = rawAttempt.startedAt.getTime()
    const durationMs = rawAttempt.exam.duration * 60 * 1000
    const now = Date.now()
    if (now - startTime > durationMs + 10000) {
      return NextResponse.json({ error: 'Time expired', timeExpired: true })
    }

    const formattedQuestions = rawAttempt.exam.questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: JSON.stringify([q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean)),
      marks: q.marks
    }))

    const attempt = {
      ...rawAttempt,
      exam: {
        ...rawAttempt.exam,
        title: rawAttempt.exam.examName,
        questions: formattedQuestions
      }
    }

    return NextResponse.json({ attempt })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const { attemptId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { action } = body

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { exam: true }
    })

    if (!attempt || attempt.userId !== payload.id || attempt.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Invalid attempt' }, { status: 400 })
    }

    if (action === 'SAVE_ANSWER') {
      const { questionId, selectedAnswer } = body
      
      const question = await prisma.question.findUnique({ where: { id: questionId } })
      if (!question) return NextResponse.json({ error: 'Invalid question' }, { status: 400 })

      const isCorrect = question.correctAnswer === selectedAnswer
      const marks = isCorrect ? question.marks : 0

      await prisma.answer.upsert({
        where: { attemptId_questionId: { attemptId, questionId } },
        update: { selectedAnswer, isCorrect, marks },
        create: { attemptId, questionId, selectedAnswer, isCorrect, marks }
      })

      return NextResponse.json({ success: true })
    } 
    
    else if (action === 'SUBMIT_EXAM') {
      const answers = await prisma.answer.findMany({ where: { attemptId } })
      const questions = await prisma.question.findMany({ where: { examId: attempt.examId } })

      let score = 0
      answers.forEach(ans => {
        if (ans.isCorrect) {
          score += ans.marks
        }
      })

      const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0) || 100
      const passingMarks = Math.ceil(totalMarks * 0.4)
      const passStatus = score >= passingMarks ? 'PASS' : 'FAIL'

      let student = await prisma.student.findUnique({ where: { userId: attempt.userId } })
      if (!student) {
        student = await prisma.student.create({
          data: {
            userId: attempt.userId,
            rollNumber: `CS${Date.now().toString().slice(-6)}`,
            course: 'General'
          }
        })
      }

      await prisma.$transaction([
        prisma.attempt.update({
          where: { id: attemptId },
          data: { status: 'COMPLETED', submittedAt: new Date() }
        }),
        prisma.result.create({
          data: {
            studentId: student.id,
            examId: attempt.examId,
            attemptId,
            score,
            totalMarks,
            resultStatus: passStatus
          }
        })
      ])

      return NextResponse.json({ success: true, resultId: attempt.id })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
