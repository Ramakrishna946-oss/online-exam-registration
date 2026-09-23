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
    const role = payload.role as string

    if (role === 'ADMIN') {
      const registrations = await prisma.registration.findMany({
        include: {
          student: {
            include: { user: { select: { name: true, email: true } } }
          },
          exam: true
        },
        orderBy: { registeredAt: 'desc' }
      })
      return NextResponse.json({ registrations })
    }

    let student = await prisma.student.findUnique({ where: { userId } })
    if (!student) {
      return NextResponse.json({ registrations: [] })
    }

    const registrations = await prisma.registration.findMany({
      where: { studentId: student.id },
      include: {
        exam: true,
        student: {
          include: { user: { select: { name: true, email: true } } }
        }
      },
      orderBy: { registeredAt: 'desc' }
    })

    return NextResponse.json({ registrations })
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

    const userId = payload.id as string
    const body = await req.json()
    const { examId, paymentStatus } = body

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 })
    }

    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam || exam.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Exam is not available for registration' }, { status: 400 })
    }

    let student = await prisma.student.findUnique({ where: { userId } })
    if (!student) {
      student = await prisma.student.create({
        data: {
          userId,
          rollNumber: `CS${Date.now().toString().slice(-6)}`,
          course: 'B.Tech Computer Science'
        }
      })
    }

    const existingReg = await prisma.registration.findUnique({
      where: { studentId_examId: { studentId: student.id, examId } }
    })

    if (existingReg) {
      return NextResponse.json({ error: 'You are already registered for this exam', registration: existingReg }, { status: 400 })
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000)
    const appNumber = `REG-2026-${randomSuffix}`

    const registration = await prisma.registration.create({
      data: {
        appNumber,
        studentId: student.id,
        examId,
        paymentStatus: paymentStatus || 'PAID',
        appStatus: 'APPROVED',
        status: 'REGISTERED'
      },
      include: {
        exam: true,
        student: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    })

    return NextResponse.json({ registration })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
