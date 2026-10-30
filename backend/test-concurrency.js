/**
 * Automated Concurrency Test Script
 * Demonstrates Requirement 5: Double Booking Prevention
 *
 * Sends two simultaneous booking requests for the exact same doctor, date, and slot
 * from two different patient accounts. Verifies that exactly one succeeds and the other
 * receives an HTTP 409 with the required message.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function testConcurrency() {
  console.log('===============================================================');
  console.log(' RUNNING CONCURRENCY & DOUBLE-BOOKING PREVENTION TEST');
  console.log('===============================================================');

  try {
    // 1. Register or Login Patient A
    console.log('[1/5] Authenticating Patient A...');
    const patientAEmail = `patient_a_${Date.now()}@test.com`;
    const regResA = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Patient A',
        email: patientAEmail,
        phone: '+91 99999 11111',
        password: 'Password123!',
      }),
    });
    const authA = await regResA.json();
    if (!authA.token) throw new Error('Patient A registration failed: ' + authA.message);

    // 2. Register or Login Patient B
    console.log('[2/5] Authenticating Patient B...');
    const patientBEmail = `patient_b_${Date.now()}@test.com`;
    const regResB = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Patient B',
        email: patientBEmail,
        phone: '+91 99999 22222',
        password: 'Password123!',
      }),
    });
    const authB = await regResB.json();
    if (!authB.token) throw new Error('Patient B registration failed: ' + authB.message);

    // 3. Get first available doctor
    console.log('[3/5] Fetching doctors list...');
    const docsRes = await fetch(`${API_BASE}/doctors`);
    const docsData = await docsRes.json();
    if (!docsData.doctors || docsData.doctors.length === 0) {
      throw new Error('No doctors found. Please run "npm run seed" first.');
    }
    const targetDoctor = docsData.doctors[0];

    // Pick a test date 5 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    const targetSlot = '11:00 - 11:30';

    console.log(`[4/5] Target Doctor: ${targetDoctor.name} (${targetDoctor.specialization})`);
    console.log(`      Target Date:   ${dateStr}`);
    console.log(`      Target Slot:   ${targetSlot}`);

    // 4. Dispatch two simultaneous booking requests
    console.log('\n[5/5] DISPATCHING TWO SIMULTANEOUS BOOKING REQUESTS (Promise.all)...');
    const startMs = Date.now();

    const [resA, resB] = await Promise.all([
      fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authA.token}`,
        },
        body: JSON.stringify({
          doctorId: targetDoctor._id,
          date: dateStr,
          timeSlot: targetSlot,
          patientName: 'Patient A',
          patientPhone: '+91 99999 11111',
          reason: 'Concurrency Test Slot Race A',
        }),
      }),
      fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authB.token}`,
        },
        body: JSON.stringify({
          doctorId: targetDoctor._id,
          date: dateStr,
          timeSlot: targetSlot,
          patientName: 'Patient B',
          patientPhone: '+91 99999 22222',
          reason: 'Concurrency Test Slot Race B',
        }),
      }),
    ]);

    const dataA = await resA.json();
    const dataB = await resB.json();
    const durationMs = Date.now() - startMs;

    console.log(`\nRequests completed in ${durationMs}ms`);
    console.log('---------------------------------------------------------------');
    console.log(`Patient A Response: HTTP ${resA.status}`, dataA);
    console.log(`Patient B Response: HTTP ${resB.status}`, dataB);
    console.log('---------------------------------------------------------------');

    // 5. Verification checks
    const oneSucceeded = (resA.status === 201 && resB.status === 409) || (resB.status === 201 && resA.status === 409);
    const expectedErrorMessage =
      dataA.message?.includes('Sorry, this time slot has just been booked') ||
      dataB.message?.includes('Sorry, this time slot has just been booked');

    if (oneSucceeded && expectedErrorMessage) {
      console.log(' TEST PASSED SUCCESSFULLY!');
      console.log(' Database unique constraint and atomic validation successfully');
      console.log(' prevented double booking under simultaneous concurrent requests.');
    } else {
      console.error(' TEST FAILED!');
      console.error('Expected one 201 and one 409, but got:', {
        statusA: resA.status,
        statusB: resB.status,
      });
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
}

testConcurrency();
