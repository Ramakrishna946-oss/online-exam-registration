import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  try {
    const { id, questionId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const body = await req.json()
    const { questionText, options, optionA, optionB, optionC, optionD, correctAnswer, marks } = body

    const optA = optionA || (Array.isArray(options) ? options[0] : undefined)
    const optB = optionB || (Array.isArray(options) ? options[1] : undefined)
    const optC = optionC || (Array.isArray(options) ? options[2] : undefined)
    const optD = optionD || (Array.isArray(options) ? options[3] : undefined)

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...(questionText && { questionText }),
        ...(optA !== undefined && { optionA: optA }),
        ...(optB !== undefined && { optionB: optB }),
        ...(optC !== undefined && { optionC: optC }),
        ...(optD !== undefined && { optionD: optD }),
        ...(correctAnswer && { correctAnswer }),
        ...(marks !== undefined && { marks: parseInt(marks) })
      }
    })

    return NextResponse.json({
      question: {
        ...updatedQuestion,
        options: JSON.stringify([updatedQuestion.optionA, updatedQuestion.optionB, updatedQuestion.optionC, updatedQuestion.optionD].filter(Boolean))
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  try {
    const { questionId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    await prisma.question.delete({
      where: { id: questionId }
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
