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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        student: true
      }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ profile: user })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = payload.id as string
    const body = await req.json()
    const { name, course, phone } = body

    let student = await prisma.student.findUnique({ where: { userId } })
    if (!student) {
      student = await prisma.student.create({
        data: {
          userId,
          rollNumber: `CS${Date.now().toString().slice(-6)}`,
          course: course || 'General',
          phone: phone || null
        }
      })
    } else {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          course: course !== undefined ? course : student.course,
          phone: phone !== undefined ? phone : student.phone
        }
      })
    }

    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name }
      })
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        student: true
      }
    })

    return NextResponse.json({ profile: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
