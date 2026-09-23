import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import * as bcrypt from 'bcryptjs'

const url = process.env.DATABASE_URL || 'file:./dev.db'
const adapter = new PrismaBetterSqlite3({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash: adminPassword,
      name: 'Dr. S. K. Sharma (Exam Controller)',
      role: 'ADMIN'
    }
  })
  console.log(`Admin user created: ${admin.email}`)

  // 2. Create Student 1
  const student1Password = await bcrypt.hash('student123', 10)
  const student1User = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      passwordHash: student1Password,
      name: 'Rahul Kumar',
      role: 'STUDENT'
    }
  })

  const student1Profile = await prisma.student.upsert({
    where: { userId: student1User.id },
    update: {
      dob: '2003-05-15',
      gender: 'Male',
      college: 'RK College of Engineering & Technology',
      address: '123 University Campus Road, City Center'
    },
    create: {
      userId: student1User.id,
      rollNumber: 'CS2026001',
      course: 'B.Tech Computer Science',
      phone: '9876543210',
      dob: '2003-05-15',
      gender: 'Male',
      college: 'RK College of Engineering & Technology',
      address: '123 University Campus Road, City Center'
    }
  })
  console.log(`Student 1 created: ${student1User.email} (Roll: ${student1Profile.rollNumber})`)

  // 3. Create Student 2
  const student2Password = await bcrypt.hash('student123', 10)
  const student2User = await prisma.user.upsert({
    where: { email: 'anita@demo.com' },
    update: {},
    create: {
      email: 'anita@demo.com',
      passwordHash: student2Password,
      name: 'Anita Sharma',
      role: 'STUDENT'
    }
  })

  const student2Profile = await prisma.student.upsert({
    where: { userId: student2User.id },
    update: {
      dob: '2004-02-20',
      gender: 'Female',
      college: 'RK College of Engineering & Technology',
      address: '458 College Avenue, North Wing'
    },
    create: {
      userId: student2User.id,
      rollNumber: 'CS2026002',
      course: 'B.Tech Information Technology',
      phone: '9812345678',
      dob: '2004-02-20',
      gender: 'Female',
      college: 'RK College of Engineering & Technology',
      address: '458 College Avenue, North Wing'
    }
  })
  console.log(`Student 2 created: ${student2User.email} (Roll: ${student2Profile.rollNumber})`)

  // 4. Create Sample Exams
  const exam1 = await prisma.exam.upsert({
    where: { id: 'demo-exam-1' },
    update: {
      examCode: 'GK-2026',
      examFee: 350,
      eligibility: 'Open to all Semester 1 to 8 Undergraduate Students',
      regStartDate: new Date('2026-08-01T00:00:00Z'),
      regEndDate: new Date('2026-09-15T23:59:59Z')
    },
    create: {
      id: 'demo-exam-1',
      examName: 'General Knowledge & Aptitude Entrance Assessment',
      examCode: 'GK-2026',
      subject: 'General Aptitude',
      examDate: new Date('2026-09-20T10:00:00Z'),
      startTime: '10:00 AM',
      duration: 15,
      description: 'Standardized entrance and aptitude evaluation test for technical and management courses.',
      examFee: 350,
      eligibility: 'Open to all Semester 1 to 8 Undergraduate Students',
      regStartDate: new Date('2026-08-01T00:00:00Z'),
      regEndDate: new Date('2026-09-15T23:59:59Z'),
      status: 'PUBLISHED'
    }
  })

  const exam2 = await prisma.exam.upsert({
    where: { id: 'demo-exam-2' },
    update: {
      examCode: 'DBMS-302',
      examFee: 500,
      eligibility: 'Passed CS-201 Data Structures with minimum 60% aggregate',
      regStartDate: new Date('2026-08-10T00:00:00Z'),
      regEndDate: new Date('2026-09-25T23:59:59Z')
    },
    create: {
      id: 'demo-exam-2',
      examName: 'Database Management Systems Semester Certification',
      examCode: 'DBMS-302',
      subject: 'Computer Science & Engineering',
      examDate: new Date('2026-09-28T14:00:00Z'),
      startTime: '02:00 PM',
      duration: 30,
      description: 'Comprehensive certification exam covering Relational DB, SQL Queries, Normalization, and ACID properties.',
      examFee: 500,
      eligibility: 'Passed CS-201 Data Structures with minimum 60% aggregate',
      regStartDate: new Date('2026-08-10T00:00:00Z'),
      regEndDate: new Date('2026-09-25T23:59:59Z'),
      status: 'PUBLISHED'
    }
  })

  const exam3 = await prisma.exam.upsert({
    where: { id: 'demo-exam-3' },
    update: {},
    create: {
      id: 'demo-exam-3',
      examName: 'Advanced Web Engineering & Cloud Architecture',
      examCode: 'WEB-401',
      subject: 'Information Technology',
      examDate: new Date('2026-10-05T11:00:00Z'),
      startTime: '11:00 AM',
      duration: 45,
      description: 'Advanced assessment on React.js, Next.js App Router, REST APIs, Microservices, and Cloud Security.',
      examFee: 600,
      eligibility: 'B.Tech IT / CSE 3rd and 4th Year Students',
      regStartDate: new Date('2026-09-01T00:00:00Z'),
      regEndDate: new Date('2026-09-30T23:59:59Z'),
      status: 'PUBLISHED'
    }
  })

  // 5. Create Sample Questions for Exam 1
  const existingQuestions1 = await prisma.question.findMany({ where: { examId: exam1.id } })
  if (existingQuestions1.length === 0) {
    await prisma.question.createMany({
      data: [
        {
          examId: exam1.id,
          questionText: 'What is the capital of France?',
          optionA: 'London',
          optionB: 'Berlin',
          optionC: 'Paris',
          optionD: 'Madrid',
          correctAnswer: 'Paris',
          marks: 10
        },
        {
          examId: exam1.id,
          questionText: 'Which planet in our solar system is known as the Red Planet?',
          optionA: 'Venus',
          optionB: 'Mars',
          optionC: 'Jupiter',
          optionD: 'Saturn',
          correctAnswer: 'Mars',
          marks: 10
        },
        {
          examId: exam1.id,
          questionText: 'Who painted the Mona Lisa?',
          optionA: 'Vincent van Gogh',
          optionB: 'Pablo Picasso',
          optionC: 'Leonardo da Vinci',
          optionD: 'Michelangelo',
          correctAnswer: 'Leonardo da Vinci',
          marks: 10
        }
      ]
    })
    console.log('Sample questions added to Exam 1.')
  }

  // 6. Create Sample Questions for Exam 2
  const existingQuestions2 = await prisma.question.findMany({ where: { examId: exam2.id } })
  if (existingQuestions2.length === 0) {
    await prisma.question.createMany({
      data: [
        {
          examId: exam2.id,
          questionText: 'Which SQL keyword is used to retrieve data from a database?',
          optionA: 'GET',
          optionB: 'OPEN',
          optionC: 'FETCH',
          optionD: 'SELECT',
          correctAnswer: 'SELECT',
          marks: 10
        },
        {
          examId: exam2.id,
          questionText: 'What type of key uniquely identifies each record in a relational table?',
          optionA: 'Foreign Key',
          optionB: 'Primary Key',
          optionC: 'Secondary Key',
          optionD: 'Composite Key',
          correctAnswer: 'Primary Key',
          marks: 10
        }
      ]
    })
    console.log('Sample questions added to Exam 2.')
  }

  // 7. Create Sample Registration for Student 1
  await prisma.registration.upsert({
    where: { studentId_examId: { studentId: student1Profile.id, examId: exam1.id } },
    update: {
      appNumber: 'REG-2026-89101',
      paymentStatus: 'PAID',
      appStatus: 'APPROVED'
    },
    create: {
      appNumber: 'REG-2026-89101',
      studentId: student1Profile.id,
      examId: exam1.id,
      status: 'REGISTERED',
      paymentStatus: 'PAID',
      appStatus: 'APPROVED'
    }
  })

  // 8. Create Sample Notifications
  const existingNotifications = await prisma.notification.findMany()
  if (existingNotifications.length === 0) {
    await prisma.notification.createMany({
      data: [
        {
          title: 'Online Exam Portal Registration Open for Fall 2026',
          message: 'All registered college candidates are requested to verify their roll numbers and course details before submitting exam fees.',
          type: 'ANNOUNCEMENT',
          target: 'ALL'
        },
        {
          title: 'Exam Schedule Announced for DBMS-302',
          message: 'Database Management Systems examination is scheduled for Sept 28, 2026 at 02:00 PM. Admit card generation will open 3 days prior.',
          type: 'INFO',
          target: 'STUDENT'
        },
        {
          title: 'Important: Admit Card & Identity Verification Required',
          message: 'Candidates must bring a printed copy of the Application Slip along with a valid College ID Card to the online proctored hall.',
          type: 'WARNING',
          target: 'ALL'
        }
      ]
    })
    console.log('Sample notifications created.')
  }

  console.log('Database seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
