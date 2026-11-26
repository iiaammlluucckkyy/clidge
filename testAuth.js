/**
 * CLIDGE Authentication & Role-Based Security Verification Suite
 */

import {
  registerStudent,
  loginUser,
  logoutUser,
  provisionTeacherAccount,
  requestPasswordReset,
  sendVerificationEmail
} from './src/services/authService.js';

// Setup mock browser localStorage for headless Node test environment
if (typeof localStorage === 'undefined') {
  const storage = {};
  global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => { storage[key] = String(val); },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  };
}

const runTests = async () => {
  console.log('🧪 Starting CLIDGE Real Authentication Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  };

  // Test 1: Student Registration (Valid)
  console.log('--- TEST 1: Register New Student ---');
  try {
    const student = await registerStudent({
      name: 'Karthik Subramanian',
      email: 'karthik.731622csr088@muthayammal.edu.in',
      password: 'SecurePassword@123',
      registrationNumber: '731622CSR088',
      department: 'Computer Science and Engineering',
      year: 'III Year / B.E.'
    });

    assert(student.email === 'karthik.731622csr088@muthayammal.edu.in', 'Student email stored accurately');
    assert(student.role === 'student', 'SECURITY: New registration is assigned role "student" by default');
    assert(Boolean(student.uid), 'User ID generated and assigned');
    assert(student.registrationNumber === '731622CSR088', 'Registration number validated');
  } catch (err) {
    console.error('Registration error:', err.message);
    assert(false, 'Registration succeeded without errors');
  }

  // Test 2: Student Login (Valid Credentials)
  console.log('\n--- TEST 2: Log in as Registered Student ---');
  try {
    const loggedIn = await loginUser({
      email: 'karthik.731622csr088@muthayammal.edu.in',
      password: 'SecurePassword@123',
      requiredRole: 'student'
    });
    assert(loggedIn.role === 'student', 'Student successfully authenticated into student portal');
    assert(loggedIn.name === 'Karthik Subramanian', 'Student profile hydrated correctly');
  } catch (err) {
    assert(false, `Student login failed: ${err.message}`);
  }

  // Test 3: Logout
  console.log('\n--- TEST 3: User Logout ---');
  try {
    await logoutUser();
    const session = localStorage.getItem('clidge_current_session_v2');
    assert(session === null, 'Session cleared on logout');
  } catch (err) {
    assert(false, `Logout error: ${err.message}`);
  }

  // Test 4: Teacher Login (Authorized Teacher Account)
  console.log('\n--- TEST 4: Log in as Authorized Teacher ---');
  try {
    const teacher = await loginUser({
      email: 'meenakshi.cse@muthayammal.edu.in',
      password: 'Password@123',
      requiredRole: 'teacher'
    });
    assert(teacher.role === 'teacher', 'Authorized faculty authenticated into faculty portal');
    assert(teacher.designation.includes('Associate Professor'), 'Teacher credentials verified');
  } catch (err) {
    assert(false, `Teacher login failed: ${err.message}`);
  }

  // Test 5: Role-Based Access Control (Student barred from Teacher Portal)
  console.log('\n--- TEST 5: Verify Role-Based Access Control ---');
  try {
    // Attempt to log into teacher portal using student account
    await loginUser({
      email: 'karthik.731622csr088@muthayammal.edu.in',
      password: 'SecurePassword@123',
      requiredRole: 'teacher'
    });
    assert(false, 'SECURITY BREACH: Student was able to log into teacher portal!');
  } catch (err) {
    assert(
      err.message.includes('Access Denied') || err.message.includes('student privileges'),
      'SECURITY CONFIRMED: Student blocked from teacher portal with access denied error'
    );
  }

  // Test 6: Invalid Credentials Testing
  console.log('\n--- TEST 6: Test Invalid Credentials & Form Validation ---');
  try {
    await loginUser({
      email: 'karthik.731622csr088@muthayammal.edu.in',
      password: 'WrongPassword@999',
      requiredRole: 'student'
    });
    assert(false, 'Should have failed with wrong password');
  } catch (err) {
    assert(err.message.includes('Incorrect password'), 'Wrong password rejected with clear error');
  }

  try {
    await loginUser({
      email: 'nonexistent.user@muthayammal.edu.in',
      password: 'SomePassword@123',
      requiredRole: 'student'
    });
    assert(false, 'Should have failed with non-existent account');
  } catch (err) {
    assert(err.message.includes('No account found'), 'Non-existent account rejected with clear error');
  }

  // Test 7: Teacher Provisioning Security
  console.log('\n--- TEST 7: Teacher Provisioning Security ---');
  try {
    // Bad secret
    await provisionTeacherAccount({
      name: 'Hacker User',
      email: 'fake.teacher@muthayammal.edu.in',
      password: 'Password@123',
      registrationNumber: 'FAC-FAKE-001',
      department: 'CSE',
      adminSecret: 'WRONG_SECRET'
    });
    assert(false, 'SECURITY BREACH: Unauthorized teacher provisioning succeeded!');
  } catch (err) {
    assert(err.message.includes('Unauthorized'), 'Unauthorized teacher provisioning rejected');
  }

  try {
    // Valid secret
    const newTeacher = await provisionTeacherAccount({
      name: 'Dr. V. Rajesh, HOD/IT',
      email: 'rajesh.it@muthayammal.edu.in',
      password: 'HodPassword@2026',
      registrationNumber: 'FAC-MEC-IT-001',
      department: 'Information Technology',
      designation: 'Professor & Head of Department',
      adminSecret: 'MEC-CSE-ADMIN-SECURE-2026'
    });
    assert(newTeacher.role === 'teacher', 'Authorized admin successfully provisioned new faculty account');
  } catch (err) {
    assert(false, `Authorized provisioning error: ${err.message}`);
  }

  // Test 8: Password Reset Flow (Self-Service)
  console.log('\n--- TEST 8: Password Reset Request ---');
  try {
    const resetResult = await requestPasswordReset('lakshmanaraja@clidge.edu.in');
    assert(resetResult.success === true, 'Password reset request accepted for valid account');
    assert(typeof resetResult.message === 'string' && resetResult.message.length > 0, 'Password reset returned institutional guidance message');

    // Verify reset works by logging in with temporary reset password
    const resetLogin = await loginUser({
      email: 'lakshmanaraja@clidge.edu.in',
      password: 'Clidge@2026',
      requiredRole: 'student'
    });
    assert(resetLogin.email === 'lakshmanaraja@clidge.edu.in', 'Student successfully logged in after password recovery');
  } catch (err) {
    assert(false, `Password reset request failed: ${err.message}`);
  }

  try {
    // Non-existent email should be rejected
    await requestPasswordReset('unknown.nonexistent@clidge.edu.in');
    assert(false, 'Should reject password reset for non-existent account');
  } catch (err) {
    assert(err.message.includes('No account found'), 'Non-existent account password reset rejected with clear error');
  }

  // Test 9: Email Verification Flow
  console.log('\n--- TEST 9: Email Verification Flow ---');
  try {
    const verifyResult = await sendVerificationEmail();
    assert(verifyResult.success === true, 'Verification email dispatch triggered successfully');
    assert(typeof verifyResult.message === 'string', 'Verification email status message received');
  } catch (err) {
    assert(false, `Email verification failed: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`🏁 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
