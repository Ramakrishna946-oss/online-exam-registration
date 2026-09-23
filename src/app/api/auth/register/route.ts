import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone, rollNumber, course, dob, gender, college, address, photoUrl } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const normalizedEmail = email.trim().toLowerCase()
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const generatedRoll = rollNumber?.trim() || `CS${Date.now().toString().slice(-6)}`
    const existingRoll = await prisma.student.findUnique({ where: { rollNumber: generatedRoll } })
    if (existingRoll) {
      return NextResponse.json({ error: 'Roll number already registered' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // First user becomes ADMIN
    const count = await prisma.user.count()
    const role = count === 0 ? 'ADMIN' : 'STUDENT'

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role,
        ...(role === 'STUDENT' ? {
          student: {
            create: {
              rollNumber: generatedRoll,
              course: course || 'B.Tech Computer Science',
              phone: phone || null,
              dob: dob || null,
              gender: gender || null,
              college: college || 'RK College of Engineering & Technology',
              address: address || null,
              photoUrl: photoUrl || null
            }
          }
        } : {})
      }
    })

    const token = await signToken({ id: user.id, email: user.email, role: user.role })
    
    const cookieStore = await cookies()
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 1 day
    })

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
