import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    let isAdmin = false
    if (token) {
      const payload = await verifyToken(token)
      if (payload && payload.role === 'ADMIN') {
        isAdmin = true
      }
    }

    const rawQuestions = await prisma.question.findMany({
      where: { examId: id },
      orderBy: { createdAt: 'asc' }
    })

    const questions = rawQuestions.map(q => {
      const formatted = {
        ...q,
        options: JSON.stringify([q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean))
      }
      if (!isAdmin) {
        // Strip correct answer for non-admins if general lookup
        delete (formatted as any).correctAnswer
      }
      return formatted
    })

    return NextResponse.json({ questions })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })

    const body = await req.json()
    const { questionText, options, optionA, optionB, optionC, optionD, correctAnswer, marks } = body

    const optA = optionA || (Array.isArray(options) ? options[0] : '')
    const optB = optionB || (Array.isArray(options) ? options[1] : '')
    const optC = optionC || (Array.isArray(options) ? options[2] : '')
    const optD = optionD || (Array.isArray(options) ? options[3] : '')

    if (!questionText || !optA || !optB || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required question fields (questionText, options, correctAnswer)' }, { status: 400 })
    }

    const question = await prisma.question.create({
      data: {
        examId: id,
        questionText,
        optionA: optA,
        optionB: optB,
        optionC: optC || '',
        optionD: optD || '',
        correctAnswer,
        marks: parseInt(marks) || 1
      }
    })

    return NextResponse.json({
      question: {
        ...question,
        options: JSON.stringify([question.optionA, question.optionB, question.optionC, question.optionD].filter(Boolean))
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
