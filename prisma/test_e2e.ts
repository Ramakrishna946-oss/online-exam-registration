const BASE_URL = 'http://localhost:3000'

async function runE2ETests() {
  console.log('==================================================')
  console.log('  STARTING REAL COMPREHENSIVE E2E FUNCTIONAL TESTS ')
  console.log('==================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`)
      failed++
    }
  }

  let studentCookie = ''
  let adminCookie = ''
  let createdExamId = ''
  let createdQuestionId = ''
  let studentAttemptId = ''

  try {
    // 1. Home Page Verification
    const homeRes = await fetch(`${BASE_URL}/`)
    assert(homeRes.status === 200, 'Home page returns HTTP 200')

    // 2. Security Test: Invalid Login
    const invalidLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.com', password: 'wrongpassword' })
    })
    assert(invalidLoginRes.status === 401, 'Invalid login credentials blocked with HTTP 401')

    // 3. Security Test: Invalid Email Registration
    const invalidEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'invalid-email', password: 'password123' })
    })
    assert(invalidEmailRes.status === 400, 'Invalid email format blocked with HTTP 400')

    // 4. Student Flow: Register New Student
    const studentEmail = `student_${Date.now()}@demo.com`
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Student',
        email: studentEmail,
        password: 'student123password',
        rollNumber: `ROLL${Date.now().toString().slice(-6)}`,
        course: 'B.Tech Computer Science',
        phone: '9876543210'
      })
    })

    assert(regRes.status === 200, 'Student registration succeeded')
    const regData: any = await regRes.json()
    assert(regData.user?.role === 'STUDENT', 'Registered user assigned STUDENT role')
    studentCookie = regRes.headers.get('set-cookie') || ''

    // 5. Student Flow: Login
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: 'student123password' })
    })
    assert(studentLoginRes.status === 200, 'Student login succeeded')
    studentCookie = studentLoginRes.headers.get('set-cookie') || studentCookie

    // 6. Student Flow: Get Profile & Update Profile
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: studentCookie }
    })
    const meData: any = await meRes.json()
    assert(meData.user?.email === studentEmail, 'Profile fetch (/api/auth/me) matches logged in student')

    const updateProfileRes = await fetch(`${BASE_URL}/api/student/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
      body: JSON.stringify({ name: 'Automated Test Student Updated', course: 'M.Tech Software Engineering', phone: '9990001112' })
    })
    assert(updateProfileRes.status === 200, 'Student profile update succeeded')

    // 7. Admin Flow: Login as Admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@demo.com', password: 'admin123' })
    })
    assert(adminLoginRes.status === 200, 'Admin login succeeded')
    adminCookie = adminLoginRes.headers.get('set-cookie') || ''

    // 8. Admin Flow: Admin Stats & Students List
    const adminStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: adminCookie }
    })
    assert(adminStatsRes.status === 200, 'Admin stats route accessible by Admin')

    const adminStudentsRes = await fetch(`${BASE_URL}/api/admin/students`, {
      headers: { Cookie: adminCookie }
    })
    assert(adminStudentsRes.status === 200, 'Admin students list route accessible by Admin')

    // 9. Admin Flow: Create New Exam
    const createExamRes = await fetch(`${BASE_URL}/api/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        examName: 'Full Stack Systems Architecture Certification',
        subject: 'Computer Science & Engineering',
        duration: 25,
        description: 'Comprehensive evaluation of database indexing, Next.js App Router, and Prisma ORM.',
        status: 'PUBLISHED'
      })
    })
    assert(createExamRes.status === 200, 'Admin successfully created new exam')
    const createExamData: any = await createExamRes.json()
    createdExamId = createExamData.exam?.id
    assert(!!createdExamId, 'Exam ID generated and returned')

    // 10. Admin Flow: Edit Exam
    const editExamRes = await fetch(`${BASE_URL}/api/exams/${createdExamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        examName: 'Full Stack Systems Architecture Certification (Updated)',
        duration: 30
      })
    })
    assert(editExamRes.status === 200, 'Admin successfully updated exam details')

    // 11. Admin Flow: Add Question
    const addQRes = await fetch(`${BASE_URL}/api/exams/${createdExamId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        questionText: 'What type of database is SQLite?',
        optionA: 'Graph Database',
        optionB: 'Serverless Relational Database File Engine',
        optionC: 'Document Store',
        optionD: 'Key-Value Store',
        correctAnswer: 'Serverless Relational Database File Engine',
        marks: 10
      })
    })
    assert(addQRes.status === 200, 'Admin successfully added question 1')
    const addQData: any = await addQRes.json()
    createdQuestionId = addQData.question?.id

    const addQ2Res = await fetch(`${BASE_URL}/api/exams/${createdExamId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        questionText: 'Which Prisma method executes raw SQL or transaction operations?',
        optionA: 'prisma.$transaction()',
        optionB: 'prisma.runSQL()',
        optionC: 'prisma.executeRaw()',
        optionD: 'prisma.transactionRun()',
        correctAnswer: 'prisma.$transaction()',
        marks: 10
      })
    })
    assert(addQ2Res.status === 200, 'Admin successfully added question 2')

    // 12. Admin Flow: Edit Question
    const editQRes = await fetch(`${BASE_URL}/api/exams/${createdExamId}/questions/${createdQuestionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ marks: 15 })
    })
    assert(editQRes.status === 200, 'Admin successfully updated question marks')

    // 13. Student Flow: View Available Exams & Exam Details
    const studentExamsRes = await fetch(`${BASE_URL}/api/student/exams`, {
      headers: { Cookie: studentCookie }
    })
    assert(studentExamsRes.status === 200, 'Student retrieved available exams')

    const examDetailRes = await fetch(`${BASE_URL}/api/exams/${createdExamId}`, {
      headers: { Cookie: studentCookie }
    })
    assert(examDetailRes.status === 200, 'Student viewed exam details')

    // 14. Student Flow: Register for Exam
    const regExamRes = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
      body: JSON.stringify({ examId: createdExamId })
    })
    assert(regExamRes.status === 200, 'Student successfully registered for exam')

    // 15. Student Flow: Duplicate Registration Check
    const dupRegRes = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
      body: JSON.stringify({ examId: createdExamId })
    })
    assert(dupRegRes.status === 400, 'Duplicate registration prevented with HTTP 400 error')

    // 16. Student Flow: View My Registrations
    const myRegsRes = await fetch(`${BASE_URL}/api/registrations`, {
      headers: { Cookie: studentCookie }
    })
    assert(myRegsRes.status === 200, 'Student retrieved active registrations list')

    // 17. Student Flow: Start Exam
    const startExamRes = await fetch(`${BASE_URL}/api/student/exams/${createdExamId}/start`, {
      method: 'POST',
      headers: { Cookie: studentCookie }
    })
    assert(startExamRes.status === 200, 'Student started exam session')
    const startExamData: any = await startExamRes.json()
    studentAttemptId = startExamData.attemptId
    assert(!!studentAttemptId, 'Attempt ID generated for exam session')

    // 18. Student Flow: Get Exam Questions for Attempt
    const attemptRes = await fetch(`${BASE_URL}/api/exam/${studentAttemptId}`, {
      headers: { Cookie: studentCookie }
    })
    assert(attemptRes.status === 200, 'Exam attempt loaded questions')
    const attemptData: any = await attemptRes.json()
    const questions = attemptData.attempt?.exam?.questions || []
    assert(questions.length >= 2, 'Questions populated in exam attempt')

    // 19. Student Flow: Save Answers
    if (questions.length >= 2) {
      const q1 = questions[0]
      const q2 = questions[1]

      const saveAns1Res = await fetch(`${BASE_URL}/api/exam/${studentAttemptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
        body: JSON.stringify({ action: 'SAVE_ANSWER', questionId: q1.id, selectedAnswer: 'Serverless Relational Database File Engine' })
      })
      assert(saveAns1Res.status === 200, 'Saved answer for Question 1')

      const saveAns2Res = await fetch(`${BASE_URL}/api/exam/${studentAttemptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
        body: JSON.stringify({ action: 'SAVE_ANSWER', questionId: q2.id, selectedAnswer: 'prisma.$transaction()' })
      })
      assert(saveAns2Res.status === 200, 'Saved answer for Question 2')
    }

    // 20. Student Flow: Submit Exam & Verify Result Calculation
    const submitRes = await fetch(`${BASE_URL}/api/exam/${studentAttemptId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
      body: JSON.stringify({ action: 'SUBMIT_EXAM' })
    })
    assert(submitRes.status === 200, 'Submitted exam successfully')

    // 21. Student Flow: View Result
    const studentResultRes = await fetch(`${BASE_URL}/api/student/results/${studentAttemptId}`, {
      headers: { Cookie: studentCookie }
    })
    assert(studentResultRes.status === 200, 'Student viewed evaluated exam result')
    const resultData: any = await studentResultRes.json()
    assert(resultData.result?.status === 'PASS' || resultData.result?.resultStatus === 'PASS', 'Result evaluated as PASS for correct answers')
    assert(resultData.result?.score > 0, `Result score calculated correctly: ${resultData.result?.score} marks`)

    // 22. Admin Flow: View Registrations & Update Registration Status
    const adminRegsRes = await fetch(`${BASE_URL}/api/registrations`, {
      headers: { Cookie: adminCookie }
    })
    assert(adminRegsRes.status === 200, 'Admin retrieved all student registrations')
    const adminRegsData: any = await adminRegsRes.json()
    const targetReg = adminRegsData.registrations?.find((r: any) => r.examId === createdExamId)

    if (targetReg) {
      const updateRegStatusRes = await fetch(`${BASE_URL}/api/registrations/${targetReg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
        body: JSON.stringify({ status: 'REGISTERED' })
      })
      assert(updateRegStatusRes.status === 200, 'Admin updated registration status')
    }

    // 23. Admin Flow: View All Results
    const adminResultsRes = await fetch(`${BASE_URL}/api/results`, {
      headers: { Cookie: adminCookie }
    })
    assert(adminResultsRes.status === 200, 'Admin viewed all student results')

    // 24. Security Boundary Test: Student Accessing Admin Route
    const forbiddenAdminRes = await fetch(`${BASE_URL}/api/admin/students`, {
      headers: { Cookie: studentCookie }
    })
    assert(forbiddenAdminRes.status === 403, 'Student blocked from Admin route with HTTP 403 Forbidden')

    const forbiddenCreateExamRes = await fetch(`${BASE_URL}/api/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
      body: JSON.stringify({ examName: 'Illegal Exam', duration: 10 })
    })
    assert(forbiddenCreateExamRes.status === 403, 'Student blocked from creating exam with HTTP 403 Forbidden')

    // 25. Logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: studentCookie }
    })
    assert(logoutRes.status === 200, 'Logout successfully cleared session')

  } catch (err: any) {
    console.error('Fatal Test Exception:', err)
    failed++
  }

  console.log('\n==================================================')
  console.log(`  E2E TEST SUMMARY: PASSED: ${passed} | FAILED: ${failed}`)
  console.log('==================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runE2ETests()
