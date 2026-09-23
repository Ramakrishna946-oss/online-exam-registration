import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const students = await prisma.student.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, createdAt: true }
        },
        _count: {
          select: { registrations: true, results: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ students })
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
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const body = await req.json()
    const { name, email, password, rollNumber, course, phone } = body

    if (!name || !email || !password || !rollNumber) {
      return NextResponse.json({ error: 'Missing required fields (name, email, password, rollNumber)' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } })
    if (existingRoll) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            rollNumber,
            course: course || 'General',
            phone: phone || null
          }
        }
      },
      include: {
        student: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
