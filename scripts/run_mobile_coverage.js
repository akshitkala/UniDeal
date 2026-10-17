const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projects = ['chrome-desktop-1440', 'iphone-se-375', 'iphone-14', 'android-pixel-7'];
const specs = [
  { id: 'sell-edit', path: 'tests/12_sell_edit.spec.ts' },
  { id: 'dashboard', path: 'tests/06_dashboard_actions.spec.ts' },
  { id: 'report', path: 'tests/07_report_listing.spec.ts' },
  { id: 'admin-flows', path: 'tests/09_admin_flows.spec.ts' },
  { id: 'admin-reject-ratelimit', path: 'tests/11_admin_reject_and_ratelimit.spec.ts' }
];

const results = {};

for (const project of projects) {
  results[project] = {};
  for (const spec of specs) {
    console.log(`Running ${spec.id} on ${project}...`);
    const cmd = `npx playwright test "${spec.path}" --project="${project}" --config=e2e/playwright.config.ts`;
    const start = Date.now();
    try {
      const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`  -> PASS (${duration}s)`);
      results[project][spec.id] = { status: 'PASS', duration: `${duration}s`, error: null };
    } catch (err) {
      const duration = ((Date.now() - start) / 1000).toFixed(1);
      const stderr = err.stderr || err.stdout || err.message;
      // Extract brief error reason
      const errorMatch = stderr.match(/Error: [^\n]+/);
      const errorReason = errorMatch ? errorMatch[0] : 'Test assertion failed or timed out';
      console.log(`  -> FAIL (${duration}s): ${errorReason}`);
      results[project][spec.id] = { status: 'FAIL', duration: `${duration}s`, error: errorReason };
    }
  }
}

const outJson = path.join(__dirname, '..', 'checklist_report', 'retest-2026-10-17b', 'mobile-coverage.json');
fs.writeFileSync(outJson, JSON.stringify(results, null, 2), 'utf8');

console.log('\n--- MOBILE COVERAGE SUMMARY ---');
console.table(Object.keys(results).map(proj => {
  const row = { Project: proj };
  specs.forEach(s => {
    row[s.id] = results[proj][s.id].status;
  });
  return row;
}));
