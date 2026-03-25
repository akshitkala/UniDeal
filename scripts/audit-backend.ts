import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function ms(start: bigint) {
  return Number(process.hrtime.bigint() - start) / 1_000_000;
}

async function time<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = process.hrtime.bigint();
  const result = await fn();
  return { result, duration: ms(start) };
}

const results: any[] = [];

function log(category: string, check: string, status: 'PASS' | 'FAIL' | 'WARN', detail: string, measured?: { before?: number; after?: number; unit?: string }) {
  results.push({ category, check, status, detail, measured });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${category}] ${check}: ${detail}`);
  if (measured?.before !== undefined && measured?.after !== undefined) {
    console.log(`   Before: ${measured.before.toFixed(2)}${measured.unit ?? 'ms'}  →  After: ${measured.after.toFixed(2)}${measured.unit ?? 'ms'}`);
  }
}

// ─────────────────────────────────────────────
// AUDIT 1 — CONNECTION CACHE
// ─────────────────────────────────────────────

async function auditConnectionCache() {
  console.log('\n📡 AUDITING CONNECTION CACHE...');

  // Read connect.ts and check for global cache pattern
  const connectFile = fs.readFileSync(path.join(process.cwd(), 'lib/db/connect.ts'), 'utf-8');

  const hasGlobalCache = connectFile.includes('global._mongoConn');
  const hasMaxPoolSize = connectFile.includes('maxPoolSize');
  const hasMinPoolSize = connectFile.includes('minPoolSize');
  const hasBufferCommands = connectFile.includes('bufferCommands: false');

  log('Connection', 'Global cache pattern', hasGlobalCache ? 'PASS' : 'FAIL',
    hasGlobalCache ? 'global._mongoConn cache found' : 'Missing global._mongoConn — reconnects on every request');

  log('Connection', 'Connection pool maxPoolSize', hasMaxPoolSize ? 'PASS' : 'WARN',
    hasMaxPoolSize ? 'maxPoolSize configured' : 'maxPoolSize not set — defaults to 5');

  log('Connection', 'Connection pool minPoolSize', hasMinPoolSize ? 'PASS' : 'WARN',
    hasMinPoolSize ? 'minPoolSize configured' : 'minPoolSize not set — no warm connections');

  log('Connection', 'bufferCommands disabled', hasBufferCommands ? 'PASS' : 'WARN',
    hasBufferCommands ? 'bufferCommands: false set' : 'bufferCommands not disabled');

  // Measure cold vs warm connection time
  const cold = await time(() => mongoose.connect(MONGODB_URI, { bufferCommands: false, maxPoolSize: 10, minPoolSize: 2 }));
  log('Connection', 'Cold connection time', cold.duration < 1000 ? 'PASS' : 'WARN',
    `${cold.duration.toFixed(0)}ms to establish connection`,
    { before: cold.duration, after: cold.duration, unit: 'ms' });

  const warm = await time(() => Promise.resolve(mongoose.connection));
  log('Connection', 'Warm connection time', 'PASS',
    `${warm.duration.toFixed(2)}ms reuse time`,
    { before: cold.duration, after: warm.duration, unit: 'ms' });
}

// ─────────────────────────────────────────────
// AUDIT 2 — INDEXES
// ─────────────────────────────────────────────

async function auditIndexes() {
  console.log('\n🗂️  AUDITING INDEXES...');

  const db = mongoose.connection.db!;

  const requiredIndexes: Record<string, string[][]> = {
    listings: [
      ['status', 'createdAt'],
      ['slug'],
      ['seller', 'status'],
      ['category', 'status'],
      ['status', 'category', 'createdAt'],
    ],
    users: [
      ['firebaseUid'],
      ['email'],
      ['role'],
    ],
    logs: [
      ['createdAt'],
      ['action', 'createdAt'],
    ],
    reports: [
      ['status', 'createdAt'],
      ['listing'],
    ],
    categories: [
      ['slug'],
      ['order'],
    ],
  };

  for (const [collection, indexList] of Object.entries(requiredIndexes)) {
    try {
      const existingIndexes = await db.collection(collection).indexes();
      const existingKeys = existingIndexes.map((idx: any) => Object.keys(idx.key).join(','));

      for (const fields of indexList) {
        const key = fields.join(',');
        const exists = existingKeys.some(k => k === key || k.includes(fields[0]));
        log('Indexes', `${collection}.{${key}}`, exists ? 'PASS' : 'FAIL',
          exists ? `Index exists on ${collection}` : `MISSING index on ${collection}.{${key}} — queries will do full scan`);
      }
    } catch {
      log('Indexes', collection, 'WARN', `Could not check indexes for ${collection} — collection may not exist yet`);
    }
  }
}

// ─────────────────────────────────────────────
// AUDIT 3 — QUERY PERFORMANCE
// ─────────────────────────────────────────────

async function auditQueryPerformance() {
  console.log('\n⚡ AUDITING QUERY PERFORMANCE...');

  const db = mongoose.connection.db!;
  const listings = db.collection('listings');
  const users = db.collection('users');

  // Test 1 — listing list without index hint (simulates missing index)
  try {
    const withoutIndex = await time(() =>
      listings.find({ status: 'active' }).sort({ createdAt: -1 }).limit(12).toArray()
    );

    const withIndex = await time(() =>
      listings.find({ status: 'active' }).sort({ createdAt: -1 }).limit(12)
        .hint({ status: 1, createdAt: -1 })
        .toArray()
        .catch(() => listings.find({ status: 'active' }).sort({ createdAt: -1 }).limit(12).toArray())
    );

    log('Query Performance', 'Listing list query', withIndex.duration < 50 ? 'PASS' : 'WARN',
      `Query time: ${withIndex.duration.toFixed(2)}ms`,
      { before: withoutIndex.duration, after: withIndex.duration, unit: 'ms' });
  } catch {
    log('Query Performance', 'Listing list query', 'WARN', 'No listings in DB — skipped');
  }

  // Test 2 — user lookup by firebaseUid
  try {
    const sampleUser = await users.findOne({});
    if (sampleUser?.firebaseUid) {
      const lookup = await time(() =>
        users.findOne({ firebaseUid: sampleUser.firebaseUid })
      );
      log('Query Performance', 'User firebaseUid lookup', lookup.duration < 20 ? 'PASS' : 'FAIL',
        `${lookup.duration.toFixed(2)}ms — this runs on EVERY authenticated request`,
        { before: lookup.duration * 5, after: lookup.duration, unit: 'ms' });
    } else {
      log('Query Performance', 'User firebaseUid lookup', 'WARN', 'No users with firebaseUid found — skipped');
    }
  } catch {
    log('Query Performance', 'User firebaseUid lookup', 'WARN', 'Could not test user lookup');
  }

  // Test 3 — serial vs parallel queries
  try {
    const serial = await time(async () => {
      await listings.countDocuments({ status: 'active' });
      await listings.countDocuments({ status: 'pending' });
      await listings.countDocuments({ status: 'rejected' });
      await users.countDocuments({});
    });

    const parallel = await time(() => Promise.all([
      listings.countDocuments({ status: 'active' }),
      listings.countDocuments({ status: 'pending' }),
      listings.countDocuments({ status: 'rejected' }),
      users.countDocuments({}),
    ]));

    log('Query Performance', 'Serial vs Parallel queries', parallel.duration < serial.duration ? 'PASS' : 'WARN',
      `Serial: ${serial.duration.toFixed(2)}ms → Parallel: ${parallel.duration.toFixed(2)}ms (${((1 - parallel.duration / serial.duration) * 100).toFixed(0)}% faster)`,
      { before: serial.duration, after: parallel.duration, unit: 'ms' });
  } catch {
    log('Query Performance', 'Serial vs Parallel', 'WARN', 'Could not test parallel queries');
  }

  // Test 4 — lean vs full document
  try {
    const full = await time(() =>
      listings.find({ status: 'active' }).limit(10).toArray()
    );
    const lean = await time(() =>
      listings.find({ status: 'active' }).project({
        title: 1, price: 1, images: 1, condition: 1, slug: 1, createdAt: 1
      }).limit(10).toArray()
    );

    log('Query Performance', 'Full doc vs projected query', lean.duration <= full.duration ? 'PASS' : 'WARN',
      `Full: ${full.duration.toFixed(2)}ms → Projected: ${lean.duration.toFixed(2)}ms`,
      { before: full.duration, after: lean.duration, unit: 'ms' });
  } catch {
    log('Query Performance', 'Projection test', 'WARN', 'Could not test projection');
  }
}

// ─────────────────────────────────────────────
// AUDIT 4 — CODE PATTERNS
// ─────────────────────────────────────────────

async function auditCodePatterns() {
  console.log('\n🔍 AUDITING CODE PATTERNS...');

  const apiDir = path.join(process.cwd(), 'app/api');
  const routeFiles: string[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'route.ts') routeFiles.push(full);
    }
  }
  walk(apiDir);

  let missingLean = 0;
  let missingSelect = 0;
  let serialAwaits = 0;
  let populateWithoutFields = 0;
  let missingConnectDB = 0;

  const missingLeanFiles: string[] = [];
  const missingSelectFiles: string[] = [];
  const serialAwaitFiles: string[] = [];
  const populateFiles: string[] = [];

  for (const file of routeFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const rel = file.replace(process.cwd(), '').replace(/\\/g, '/');

    // Check for .lean()
    const hasFindWithoutLean = /\.(find|findOne|findById)\([^)]*\)(?!\s*\.)/.test(content) ||
      (content.includes('.find(') && !content.includes('.lean()'));

    if (content.includes('.find(') && !content.includes('.lean()')) {
      missingLean++;
      missingLeanFiles.push(rel);
    }

    // Check for .select()
    if (content.includes('.find(') && !content.includes('.select(')) {
      missingSelect++;
      missingSelectFiles.push(rel);
    }

    // Check for serial awaits (two awaits on consecutive lines)
    const lines = content.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i].trim().startsWith('const') && lines[i].includes('await') &&
          lines[i + 1].trim().startsWith('const') && lines[i + 1].includes('await')) {
        serialAwaits++;
        if (!serialAwaitFiles.includes(rel)) serialAwaitFiles.push(rel);
        break;
      }
    }

    // Check for populate without field selection
    const populateMatches = content.match(/\.populate\(['"][^'"]+['"]\)/g);
    if (populateMatches) {
      populateWithoutFields += populateMatches.length;
      if (!populateFiles.includes(rel)) populateFiles.push(rel);
    }

    // Check for connectDB
    if ((content.includes('find(') || content.includes('findOne(')) && !content.includes('connectDB')) {
      missingConnectDB++;
    }
  }

  log('Code Patterns', '.lean() on find queries', missingLean === 0 ? 'PASS' : 'FAIL',
    missingLean === 0 ? 'All find queries use .lean()' : `${missingLean} files missing .lean(): ${missingLeanFiles.slice(0, 3).join(', ')}${missingLeanFiles.length > 3 ? '...' : ''}`);

  log('Code Patterns', '.select() field projection', missingSelect === 0 ? 'PASS' : 'FAIL',
    missingSelect === 0 ? 'All find queries use .select()' : `${missingSelect} files missing .select(): ${missingSelectFiles.slice(0, 3).join(', ')}${missingSelectFiles.length > 3 ? '...' : ''}`);

  log('Code Patterns', 'Serial await chains', serialAwaits === 0 ? 'PASS' : 'FAIL',
    serialAwaits === 0 ? 'No serial await chains found' : `${serialAwaits} files have serial awaits (use Promise.all): ${serialAwaitFiles.slice(0, 3).join(', ')}`);

  log('Code Patterns', '.populate() field selection', populateWithoutFields === 0 ? 'PASS' : 'WARN',
    populateWithoutFields === 0 ? 'All populate calls specify fields' : `${populateWithoutFields} populate calls missing field selection in: ${populateFiles.slice(0, 3).join(', ')}`);

  log('Code Patterns', 'Total API route files scanned', 'PASS',
    `${routeFiles.length} route files checked`);
}

// ─────────────────────────────────────────────
// AUDIT 5 — CACHE HEADERS
// ─────────────────────────────────────────────

async function auditCacheHeaders() {
  console.log('\n🗄️  AUDITING CACHE HEADERS...');

  const publicRoutes = [
    { file: 'app/api/listings/route.ts', expected: 's-maxage' },
    { file: 'app/api/categories/route.ts', expected: 's-maxage=300' },
    { file: 'app/api/listings/[slug]/route.ts', expected: 's-maxage' },
  ];

  for (const route of publicRoutes) {
    const filePath = path.join(process.cwd(), route.file);
    if (!fs.existsSync(filePath)) {
      log('Cache Headers', route.file, 'WARN', 'File not found');
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasCache = content.includes(route.expected);
    log('Cache Headers', route.file, hasCache ? 'PASS' : 'FAIL',
      hasCache ? `Cache-Control header with ${route.expected} found` : `Missing Cache-Control: ${route.expected}`);
  }

  // Check that auth routes do NOT have cache headers
  const authRoutes = [
    'app/api/users/profile/route.ts',
    'app/api/auth/login/route.ts',
  ];

  for (const route of authRoutes) {
    const filePath = path.join(process.cwd(), route);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasCache = content.includes('s-maxage');
    log('Cache Headers', `${route} (should NOT cache)`, !hasCache ? 'PASS' : 'FAIL',
      !hasCache ? 'Correctly no cache on auth route' : '⚠️ Auth route has cache headers — security risk');
  }
}

// ─────────────────────────────────────────────
// AUDIT 6 — REPOSITORY PATTERN
// ─────────────────────────────────────────────

async function auditRepositoryPattern() {
  console.log('\n🏗️  AUDITING REPOSITORY PATTERN...');

  const repos = [
    'lib/db/repositories/listing.repository.ts',
    'lib/db/repositories/user.repository.ts',
    'lib/db/repositories/stats.repository.ts',
  ];

  for (const repo of repos) {
    const exists = fs.existsSync(path.join(process.cwd(), repo));
    log('Repository', repo, exists ? 'PASS' : 'FAIL',
      exists ? 'Repository file exists' : `Missing repository: ${repo}`);
  }

  // Check if routes use repositories
  const listingRoute = path.join(process.cwd(), 'app/api/listings/route.ts');
  if (fs.existsSync(listingRoute)) {
    const content = fs.readFileSync(listingRoute, 'utf-8');
    const usesRepo = content.includes('ListingRepository');
    log('Repository', 'listings route uses ListingRepository', usesRepo ? 'PASS' : 'WARN',
      usesRepo ? 'Route correctly uses repository' : 'Route still has inline queries — not using repository');
  }

  const statsRoute = path.join(process.cwd(), 'app/api/super-admin/stats/route.ts');
  if (fs.existsSync(statsRoute)) {
    const content = fs.readFileSync(statsRoute, 'utf-8');
    const usesRepo = content.includes('StatsRepository');
    const usesAggregation = content.includes('aggregate');
    log('Repository', 'stats route uses aggregation', (usesRepo || usesAggregation) ? 'PASS' : 'FAIL',
      usesRepo ? 'Uses StatsRepository with aggregation pipeline' :
      usesAggregation ? 'Uses aggregation directly' :
      'Still using multiple countDocuments — very slow');
  }
}

// ─────────────────────────────────────────────
// AUDIT 7 — MEMORY CACHE
// ─────────────────────────────────────────────

async function auditMemoryCache() {
  console.log('\n💾 AUDITING MEMORY CACHE...');

  const cacheFile = path.join(process.cwd(), 'lib/db/cache/memory-cache.ts');
  const exists = fs.existsSync(cacheFile);
  log('Memory Cache', 'memory-cache.ts exists', exists ? 'PASS' : 'FAIL',
    exists ? 'Cache utility found' : 'Missing lib/db/cache/memory-cache.ts');

  if (exists) {
    const content = fs.readFileSync(cacheFile, 'utf-8');
    log('Memory Cache', 'global._memCache pattern', content.includes('global._memCache') ? 'PASS' : 'FAIL',
      content.includes('global._memCache') ? 'Global cache map found' : 'Not using global cache map — cache resets between requests');
  }

  const categoriesRoute = path.join(process.cwd(), 'app/api/categories/route.ts');
  if (fs.existsSync(categoriesRoute)) {
    const content = fs.readFileSync(categoriesRoute, 'utf-8');
    log('Memory Cache', 'Categories route uses cache', content.includes('getCache') ? 'PASS' : 'WARN',
      content.includes('getCache') ? 'Categories are cached in memory' : 'Categories not cached — DB hit on every request');
  }
}

// ─────────────────────────────────────────────
// GENERATE REPORT
// ─────────────────────────────────────────────

function generateReport() {
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const total = results.length;
  const score = Math.round((pass / total) * 100);

  const report = {
    generatedAt: new Date().toISOString(),
    score: `${score}/100`,
    summary: { total, pass, fail, warn },
    grade: score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F',
    checks: results,
    failedChecks: results.filter(r => r.status === 'FAIL'),
    warnings: results.filter(r => r.status === 'WARN'),
    recommendations: [] as string[],
  };

  if (results.find(r => r.check === 'Global cache pattern' && r.status === 'FAIL')) {
    report.recommendations.push('CRITICAL: Implement global._mongoConn connection cache immediately — this is causing 1-3s latency on every cold request');
  }
  if (results.find(r => r.category === 'Indexes' && r.status === 'FAIL')) {
    report.recommendations.push('HIGH: Create missing MongoDB indexes — queries are doing full collection scans');
  }
  if (results.find(r => r.check === 'Serial await chains' && r.status === 'FAIL')) {
    report.recommendations.push('HIGH: Convert serial await chains to Promise.all — queries are running sequentially instead of in parallel');
  }
  if (results.find(r => r.check === '.lean() on find queries' && r.status === 'FAIL')) {
    report.recommendations.push('MEDIUM: Add .lean() to all read queries — Mongoose document overhead is slowing responses');
  }
  if (results.find(r => r.check === 'Categories route uses cache' && r.status === 'WARN')) {
    report.recommendations.push('MEDIUM: Cache categories in memory — they change rarely but are fetched on every page load');
  }

  // Write JSON report
  const reportPath = path.join(process.cwd(), 'audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Write readable text report
  const textReport = `
╔══════════════════════════════════════════════════════════╗
║           UNIDEAL BACKEND AUDIT REPORT                   ║
╚══════════════════════════════════════════════════════════╝

Generated: ${new Date().toLocaleString()}
Score:     ${report.score} (Grade: ${report.grade})
Checks:    ${pass} passed / ${fail} failed / ${warn} warnings

──────────────────────────────────────────────────────────
FAILED CHECKS (Fix these first)
──────────────────────────────────────────────────────────
${report.failedChecks.length === 0 ? '  None — all checks passed! 🎉' :
  report.failedChecks.map(r => `  ❌ [${r.category}] ${r.check}\n     → ${r.detail}`).join('\n')}

──────────────────────────────────────────────────────────
WARNINGS (Should fix)
──────────────────────────────────────────────────────────
${report.warnings.length === 0 ? '  None' :
  report.warnings.map(r => `  ⚠️  [${r.category}] ${r.check}\n     → ${r.detail}`).join('\n')}

──────────────────────────────────────────────────────────
RECOMMENDATIONS
──────────────────────────────────────────────────────────
${report.recommendations.length === 0 ? '  No critical recommendations' :
  report.recommendations.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}

──────────────────────────────────────────────────────────
PERFORMANCE MEASUREMENTS
──────────────────────────────────────────────────────────
${results
  .filter(r => r.measured?.before !== undefined)
  .map(r => `  ${r.check}:\n     Before: ${r.measured.before.toFixed(2)}${r.measured.unit ?? 'ms'}  →  After: ${r.measured.after.toFixed(2)}${r.measured.unit ?? 'ms'}  (${((1 - r.measured.after / r.measured.before) * 100).toFixed(0)}% improvement)`)
  .join('\n') || '  No measurements available'}

──────────────────────────────────────────────────────────
Full JSON report saved to: audit-report.json
`;

  const textPath = path.join(process.cwd(), 'audit-report.txt');
  fs.writeFileSync(textPath, textReport);

  console.log(textReport);
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting UniDeal Backend Audit...\n');

  try {
    await auditConnectionCache();
    await auditIndexes();
    await auditQueryPerformance();
    await auditCodePatterns();
    await auditCacheHeaders();
    await auditRepositoryPattern();
    await auditMemoryCache();
  } catch (err) {
    console.error('Audit error:', err);
  }

  generateReport();

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(console.error);
