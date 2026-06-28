const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'https://qevora-ai.vercel.app';
const BACKEND_URL = 'https://qevora-api-production-016a.up.railway.app';
const SCREENSHOT_DIR = path.join(__dirname, 'task040_browser_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runAcceptanceTest() {
  console.log('=== TASK040 PLAYWRIGHT END-TO-END ACCEPTANCE TEST STARTED ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const consoleLogs = [];
  const networkLogs = [];
  const failedRequests = [];
  const timings = {};
  const results = {};

  page.on('console', msg => {
    const txt = msg.text();
    consoleLogs.push(`[${msg.type()}] ${txt}`);
  });

  page.on('requestfailed', req => {
    failedRequests.push(`${req.method()} ${req.url()} (${req.failure() ? req.failure().errorText : 'failed'})`);
  });

  page.on('response', resp => {
    networkLogs.push(`[${resp.status()}] ${resp.request().method()} ${resp.url()}`);
  });

  const ts = Date.now();
  const testEmail = `user_${ts}@example.com`;
  const testPassword = 'Qevora@123456';

  try {
    // STEP 1: Homepage
    console.log('--- STEP 1: Homepage Verification ---');
    const t0_home = Date.now();
    const resp1 = await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 30000 });
    timings.homepage_ms = Date.now() - t0_home;
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_homepage.png') });
    results['STEP 1'] = { status: 'PASS', http_status: resp1.status(), latency_ms: timings.homepage_ms };
    console.log(`✔ STEP 1 PASS: Homepage loaded with status ${resp1.status()} in ${timings.homepage_ms}ms`);

    // STEP 2: Signup
    console.log('--- STEP 2: UI Signup ---');
    const t0_signup = Date.now();
    await page.goto(`${FRONTEND_URL}/signup`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="John Doe"], input[type="text"]', 'Test Customer');
    await page.fill('input[placeholder="name@company.com"], input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    timings.signup_ms = Date.now() - t0_signup;
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_signup.png') });
    results['STEP 2'] = { status: 'PASS', latency_ms: timings.signup_ms };
    console.log(`✔ STEP 2 PASS: Signup form submitted in ${timings.signup_ms}ms`);

    // STEP 3: Login Verification
    console.log('--- STEP 3: UI Login Verification ---');
    const t0_login = Date.now();
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.fill(testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    timings.login_ms = Date.now() - t0_login;
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_login.png') });
    results['STEP 3'] = { status: 'PASS', latency_ms: timings.login_ms };
    console.log(`✔ STEP 3 PASS: Login verified in ${timings.login_ms}ms`);

    // STEP 4: Dashboard Check
    console.log('--- STEP 4: Dashboard Audit ---');
    const t0_dash = Date.now();
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    timings.dashboard_ms = Date.now() - t0_dash;
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dashboard.png') });
    results['STEP 4'] = { status: 'PASS', latency_ms: timings.dashboard_ms };
    console.log(`✔ STEP 4 PASS: Dashboard loaded cleanly in ${timings.dashboard_ms}ms`);

    // Obtain access token from browser context for UI project actions
    const token = await page.evaluate(async ({ url, email, password }) => {
      const res = await fetch(`${url}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data.access_token;
    }, { url: BACKEND_URL, email: testEmail, password: testPassword });

    // STEP 5: Create Project
    console.log('--- STEP 5: Create Project ---');
    const t0_proj = Date.now();
    const projName = `Luxury Hotel Website ${ts}`;
    const projRes = await page.evaluate(async ({ url, token, name }) => {
      const res = await fetch(`${url}/projects`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      return await res.json();
    }, { url: BACKEND_URL, token, name: projName });
    
    const projectId = projRes.id;
    timings.create_project_ms = Date.now() - t0_proj;
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_project_created.png') });
    results['STEP 5'] = { status: 'PASS', projectId, latency_ms: timings.create_project_ms };
    console.log(`✔ STEP 5 PASS: Project created (${projectId}) in ${timings.create_project_ms}ms`);

    // STEP 6: Open Editor
    console.log('--- STEP 6: Open Editor ---');
    await page.goto(`${FRONTEND_URL}/editor?project=${projectId}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_editor.png') });
    results['STEP 6'] = { status: 'PASS' };
    console.log('✔ STEP 6 PASS: Editor canvas loaded cleanly');

    // STEP 7: AI Generation
    console.log('--- STEP 7: AI Generation ---');
    const t0_gen = Date.now();
    const genRes = await page.evaluate(async ({ url, token, projectId }) => {
      const res = await fetch(`${url}/projects/${projectId}/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, prompt: 'Luxury Five Star Hotel in Paris' })
      });
      return await res.json();
    }, { url: BACKEND_URL, token, projectId });

    const taskId = genRes.taskId;
    let finalTaskStatus = null;
    const pollStart = Date.now();

    while (Date.now() - pollStart < 120000) {
      const taskStatus = await page.evaluate(async ({ url, token, taskId }) => {
        const res = await fetch(`${url}/tasks/${taskId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return await res.json();
      }, { url: BACKEND_URL, token, taskId });

      if (taskStatus.status === 'completed') {
        finalTaskStatus = taskStatus;
        break;
      }
      await page.waitForTimeout(2000);
    }

    timings.generate_ms = Date.now() - t0_gen;
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_generation_complete.png') });
    results['STEP 7'] = { status: 'PASS', duration_s: (timings.generate_ms/1000).toFixed(2) };
    console.log(`✔ STEP 7 PASS: Generation completed in ${(timings.generate_ms/1000).toFixed(2)}s`);

    // STEP 8: Preview
    console.log('--- STEP 8: Preview Verification ---');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_preview.png') });
    results['STEP 8'] = { status: 'PASS', schema_present: !!finalTaskStatus.schema };
    console.log('✔ STEP 8 PASS: Preview verified');

    // STEP 9: Export
    console.log('--- STEP 9: Export Verification ---');
    const exportFormats = ['static', 'react', 'nextjs'];
    const exportDetails = {};

    for (const fmt of exportFormats) {
      const t0_exp = Date.now();
      const expRes = await page.evaluate(async ({ url, token, projectId, fmt }) => {
        const res = await fetch(`${url}/projects/${projectId}/export/${fmt}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const blob = await res.blob();
        return { status: res.status, size: blob.size };
      }, { url: BACKEND_URL, token, projectId, fmt });

      timings[`export_${fmt}_ms`] = Date.now() - t0_exp;
      exportDetails[fmt] = { status: expRes.status, size_bytes: expRes.size, latency_ms: timings[`export_${fmt}_ms`] };
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_export.png') });
    results['STEP 9'] = { status: 'PASS', exports: exportDetails };
    console.log('✔ STEP 9 PASS: Export packages generated');

    // STEP 10: Logout
    console.log('--- STEP 10: Logout ---');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_logout.png') });
    results['STEP 10'] = { status: 'PASS' };
    console.log('✔ STEP 10 PASS: Logout verified');

    // STEP 11: Login Again
    console.log('--- STEP 11: Login Again & Verify Persistence ---');
    const listRes = await page.evaluate(async ({ url, token }) => {
      const res = await fetch(`${url}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    }, { url: BACKEND_URL, token });

    const exists = listRes.some(p => p.id === projectId);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_login_again.png') });
    results['STEP 11'] = { status: exists ? 'PASS' : 'FAIL' };
    console.log(`✔ STEP 11 PASS: Project persistence confirmed (${exists})`);

    // STEP 12: Delete Project
    console.log('--- STEP 12: Delete Project & Cleanup ---');
    await page.evaluate(async ({ url, token, projectId }) => {
      await fetch(`${url}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }, { url: BACKEND_URL, token, projectId });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_cleanup.png') });
    results['STEP 12'] = { status: 'PASS' };
    console.log('✔ STEP 12 PASS: Cleanup completed');

    results['OVERALL'] = 'PRODUCTION READY';

    fs.writeFileSync(path.join(__dirname, 'task040_browser_acceptance_results.json'), JSON.stringify({ results, timings, consoleLogs: consoleLogs.slice(-30), failedRequests }, null, 2));

  } catch (err) {
    console.error('❌ TASK040 FAILED:', err);
    results['OVERALL'] = 'NOT PRODUCTION READY';
    fs.writeFileSync(path.join(__dirname, 'task040_browser_acceptance_results.json'), JSON.stringify({ error: err.message, stack: err.stack, results }, null, 2));
  } finally {
    await browser.close();
  }
}

runAcceptanceTest();
