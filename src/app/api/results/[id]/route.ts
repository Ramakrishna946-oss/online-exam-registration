import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } }
        },
        exam: {
          include: { questions: true }
        },
        attempt: {
          include: { answers: true }
        }
      }
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    const isAdmin = payload.role === 'ADMIN'
    const isOwner = result.student.userId === payload.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
