import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

interface FileInfo {
  path: string;
  content: string;
  lines: string[];
  size: number;
}

const results: any[] = [];

function log(category: string, issue: string, severity: 'HIGH' | 'MEDIUM' | 'LOW', detail: string, files?: string[]) {
  results.push({ category, issue, severity, detail, files });
  const icon = severity === 'HIGH' ? '🔴' : severity === 'MEDIUM' ? '🟡' : '🟢';
  console.log(`${icon} [${category}] ${issue}`);
  console.log(`   ${detail}`);
  if (files?.length) console.log(`   Files: ${files.slice(0, 3).join(', ')}${files.length > 3 ? ` +${files.length - 3} more` : ''}`);
}

function walkDir(dir: string, ext: string[] = ['.tsx', '.ts']): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
      files.push(...walkDir(full, ext));
    } else if (entry.isFile() && ext.some(e => entry.name.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

function readFiles(paths: string[]): FileInfo[] {
  return paths.map(p => {
    const content = fs.readFileSync(p, 'utf-8');
    return {
      path: p.replace(process.cwd(), '').replace(/\\/g, '/'),
      content,
      lines: content.split('\n'),
      size: content.length,
    };
  });
}

function similarity(a: string, b: string): number {
  const setA = new Set(a.split('\n').map(l => l.trim()).filter(l => l.length > 10));
  const setB = new Set(b.split('\n').map(l => l.trim()).filter(l => l.length > 10));
  const intersection = [...setA].filter(l => setB.has(l)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// ─────────────────────────────────────────────
// AUDIT 1 — Duplicate component definitions
// ─────────────────────────────────────────────

function auditDuplicateComponents(files: FileInfo[]) {
  console.log('\n🧩 AUDITING DUPLICATE COMPONENT DEFINITIONS...');

  // Find components defined in multiple files
  const componentMap = new Map<string, string[]>();

  for (const file of files) {
    const matches = file.content.matchAll(/(?:export\s+(?:default\s+)?function|const)\s+([A-Z][a-zA-Z]+)\s*(?:=|\()/g);
    for (const match of matches) {
      const name = match[1];
      if (!componentMap.has(name)) componentMap.set(name, []);
      componentMap.get(name)!.push(file.path);
    }
  }

  const duplicates = [...componentMap.entries()].filter(([, paths]) => paths.length > 1);

  if (duplicates.length === 0) {
    log('Components', 'No duplicate component names', 'LOW', 'All component names are unique across files');
  } else {
    for (const [name, paths] of duplicates) {
      log('Components', `Duplicate: ${name}`, 'HIGH',
        `Component "${name}" is defined in ${paths.length} files — should be extracted to shared component`,
        paths);
    }
  }
}

// ─────────────────────────────────────────────
// AUDIT 2 — Duplicate utility functions
// ─────────────────────────────────────────────

function auditDuplicateFunctions(files: FileInfo[]) {
  console.log('\n🔧 AUDITING DUPLICATE UTILITY FUNCTIONS...');

  const knownDuplicates = [
    { name: 'timeAgo', description: 'Time formatting function' },
    { name: 'formatPrice', description: 'Price formatting function' },
    { name: 'optimizeImage', description: 'Cloudinary image optimization' },
    { name: 'connectDB', description: 'Database connection' },
    { name: 'sanitize', description: 'Input sanitization' },
    { name: 'getUser', description: 'User fetch helper' },
  ];

  for (const fn of knownDuplicates) {
    const filesWithFn = files.filter(f =>
      f.content.includes(`function ${fn.name}`) ||
      f.content.includes(`const ${fn.name}`) ||
      f.content.includes(`${fn.name} =`)
    );

    if (filesWithFn.length > 1) {
      log('Functions', `Duplicate: ${fn.name}()`, 'HIGH',
        `${fn.description} defined in ${filesWithFn.length} files — should be in a single shared utility`,
        filesWithFn.map(f => f.path));
    }
  }

  // Generic function duplication check
  const funcMap = new Map<string, string[]>();
  for (const file of files) {
    const matches = file.content.matchAll(/(?:function|const)\s+([a-z][a-zA-Z]+)\s*(?:=\s*(?:async\s*)?\(|\()/g);
    for (const match of matches) {
      const name = match[1];
      if (name.length < 4) continue; // skip short names
      if (!funcMap.has(name)) funcMap.set(name, []);
      funcMap.get(name)!.push(file.path);
    }
  }

  const duplicateFuncs = [...funcMap.entries()].filter(([, paths]) => paths.length >= 3);
  for (const [name, paths] of duplicateFuncs) {
    log('Functions', `Repeated: ${name}()`, 'MEDIUM',
      `Function "${name}" appears in ${paths.length} files`,
      paths);
  }
}

// ─────────────────────────────────────────────
// AUDIT 3 — Duplicate inline styles
// ─────────────────────────────────────────────

function auditDuplicateStyles(files: FileInfo[]) {
  console.log('\n🎨 AUDITING DUPLICATE INLINE STYLES...');

  const stylePatterns = [
    {
      pattern: /borderRadius:\s*999/g,
      name: 'borderRadius: 999 (pill shape)',
      description: 'Pill border radius — should be a CSS variable or shared constant',
    },
    {
      pattern: /background:\s*['"]#16a34a['"]/g,
      name: 'background: #16a34a (primary green)',
      description: 'Primary color hardcoded — should use CSS variable var(--primary)',
    },
    {
      pattern: /background:\s*['"]#1a1a1a['"]/g,
      name: 'background: #1a1a1a (dark)',
      description: 'Dark color hardcoded repeatedly',
    },
    {
      pattern: /border:\s*['"]1\.5px solid #e5e7eb['"]/g,
      name: 'border: 1.5px solid #e5e7eb',
      description: 'Border style repeated — should be a shared constant',
    },
    {
      pattern: /fontWeight:\s*(?:700|800|900)/g,
      name: 'hardcoded fontWeight',
      description: 'Font weights hardcoded everywhere',
    },
  ];

  for (const { pattern, name, description } of stylePatterns) {
    let totalCount = 0;
    const affectedFiles: string[] = [];

    for (const file of files) {
      const matches = file.content.match(pattern);
      if (matches && matches.length >= 3) {
        totalCount += matches.length;
        affectedFiles.push(`${file.path} (×${matches.length})`);
      }
    }

    if (affectedFiles.length >= 2) {
      log('Styles', name, 'MEDIUM', `${description} — appears ${totalCount} times across ${affectedFiles.length} files`, affectedFiles);
    }
  }
}

// ─────────────────────────────────────────────
// AUDIT 4 — Duplicate API fetch patterns
// ─────────────────────────────────────────────

function auditDuplicateFetches(files: FileInfo[]) {
  console.log('\n🌐 AUDITING DUPLICATE API FETCH PATTERNS...');

  const fetchPatterns = [
    { pattern: /fetch\(['"]\/api\/categories['"]/g, name: 'GET /api/categories', description: 'Categories fetched in multiple components — should use a shared hook or context' },
    { pattern: /fetch\(['"]\/api\/listings['"]/g, name: 'GET /api/listings', description: 'Listings fetched in multiple places' },
    { pattern: /fetch\(['"]\/api\/users\/profile['"]/g, name: 'GET /api/users/profile', description: 'Profile fetched in multiple components — should be in AuthContext' },
  ];

  for (const { pattern, name, description } of fetchPatterns) {
    const filesWithFetch = files.filter(f => f.content.match(pattern));
    if (filesWithFetch.length > 1) {
      log('API Fetches', `Duplicate fetch: ${name}`, 'MEDIUM',
        `${description}`,
        filesWithFetch.map(f => f.path));
    }
  }
}

// ─────────────────────────────────────────────
// AUDIT 5 — Similar file content (near-duplicates)
// ─────────────────────────────────────────────

function auditSimilarFiles(files: FileInfo[]) {
  console.log('\n📄 AUDITING SIMILAR FILE CONTENT...');

  const componentFiles = files.filter(f =>
    f.path.includes('/components/') &&
    f.size > 500
  );

  const similar: Array<{ a: string; b: string; score: number }> = [];

  for (let i = 0; i < componentFiles.length; i++) {
    for (let j = i + 1; j < componentFiles.length; j++) {
      const score = similarity(componentFiles[i].content, componentFiles[j].content);
      if (score > 0.4) {
        similar.push({ a: componentFiles[i].path, b: componentFiles[j].path, score });
      }
    }
  }

  similar.sort((a, b) => b.score - a.score);

  if (similar.length === 0) {
    log('Similar Files', 'No near-duplicate components found', 'LOW', 'All component files are sufficiently distinct');
  } else {
    for (const { a, b, score } of similar.slice(0, 5)) {
      const severity = score > 0.7 ? 'HIGH' : score > 0.5 ? 'MEDIUM' : 'LOW';
      log('Similar Files', `${Math.round(score * 100)}% similar`, severity as any,
        `These files share significant code and may be candidates for merging or extracting shared logic`,
        [a, b]);
    }
  }
}

// ─────────────────────────────────────────────
// AUDIT 6 — Unused imports
// ─────────────────────────────────────────────

function auditUnusedImports(files: FileInfo[]) {
  console.log('\n📦 AUDITING POTENTIALLY UNUSED IMPORTS...');

  const unusedByFile: Array<{ file: string; imports: string[] }> = [];

  for (const file of files) {
    const importMatches = [...file.content.matchAll(/import\s+\{([^}]+)\}\s+from/g)];
    const unused: string[] = [];

    for (const match of importMatches) {
      const names = match[1].split(',').map(n => n.trim().split(' as ').pop()!.trim());
      for (const name of names) {
        if (!name || name.length < 2) continue;
        // Count usages outside the import line
        const usageCount = (file.content.match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length;
        if (usageCount <= 1) unused.push(name); // only appears in import line
      }
    }

    if (unused.length > 0) {
      unusedByFile.push({ file: file.path, imports: unused });
    }
  }

  if (unusedByFile.length === 0) {
    log('Imports', 'No unused imports detected', 'LOW', 'All imports appear to be used');
  } else {
    for (const { file, imports } of unusedByFile.slice(0, 10)) {
      log('Imports', 'Potentially unused imports', 'LOW',
        `${imports.join(', ')} — verify and remove if unused`,
        [file]);
    }
  }
}

// ─────────────────────────────────────────────
// AUDIT 7 — UI element duplication check
// ─────────────────────────────────────────────

function auditUIduplication(files: FileInfo[]) {
  console.log('\n🖼️  AUDITING UI ELEMENT DUPLICATION...');

  const uiPatterns = [
    {
      name: 'Condition Badge',
      patterns: ['CONDITION_STYLES', 'conditionStyle', 'condition badge'],
      description: 'Condition badge rendering duplicated — should be a single <ConditionBadge /> component',
    },
    {
      name: 'Time Ago formatter',
      patterns: ['timeAgo', 'time ago', 'createdAt'],
      description: 'timeAgo function likely defined in multiple files — extract to lib/utils/time.ts',
    },
    {
      name: 'Listing Card',
      patterns: ['listing.title', 'listing.price', 'listing.images'],
      description: 'Listing card markup potentially duplicated',
    },
    {
      name: 'Loading spinner',
      patterns: ['Loading...', 'loading', 'spinner'],
      description: 'Loading states may be inconsistent across pages',
    },
    {
      name: 'Empty state',
      patterns: ['No listings', 'empty state', 'no results'],
      description: 'Empty state UI duplicated across pages',
    },
    {
      name: 'Toast notification',
      patterns: ['position: \'fixed\'', 'top: 24', 'zIndex: 9999'],
      description: 'Toast notification styled inline in multiple pages — should be a single <Toast /> component',
    },
  ];

  for (const { name, patterns, description } of uiPatterns) {
    const filesWithPattern = files.filter(f =>
      patterns.some(p => f.content.toLowerCase().includes(p.toLowerCase()))
    );

    if (filesWithPattern.length >= 3) {
      log('UI Duplication', name, 'MEDIUM', description, filesWithPattern.map(f => f.path));
    }
  }
}

// ─────────────────────────────────────────────
// GENERATE REPORT
// ─────────────────────────────────────────────

function generateReport() {
  const high = results.filter(r => r.severity === 'HIGH').length;
  const medium = results.filter(r => r.severity === 'MEDIUM').length;
  const low = results.filter(r => r.severity === 'LOW').length;

  const report = {
    generatedAt: new Date().toISOString(),
    summary: { total: results.length, high, medium, low },
    issues: results,
    topPriority: results
      .filter(r => r.severity === 'HIGH')
      .map(r => `[${r.category}] ${r.issue}: ${r.detail}`),
  };

  const text = `
╔══════════════════════════════════════════════════════════╗
║         UNIDEAL DUPLICATION AUDIT REPORT                 ║
╚══════════════════════════════════════════════════════════╝

Generated: ${new Date().toLocaleString()}
Issues:    ${high} high / ${medium} medium / ${low} low

──────────────────────────────────────────────────────────
🔴 HIGH PRIORITY (fix these)
──────────────────────────────────────────────────────────
${results.filter(r => r.severity === 'HIGH').map(r =>
  `  [${r.category}] ${r.issue}\n  → ${r.detail}\n  Files: ${(r.files ?? []).slice(0, 3).join(', ')}`
).join('\n\n') || '  None'}

──────────────────────────────────────────────────────────
🟡 MEDIUM PRIORITY (refactor when possible)
──────────────────────────────────────────────────────────
${results.filter(r => r.severity === 'MEDIUM').map(r =>
  `  [${r.category}] ${r.issue}\n  → ${r.detail}\n  Files: ${(r.files ?? []).slice(0, 3).join(', ')}`
).join('\n\n') || '  None'}

──────────────────────────────────────────────────────────
🟢 LOW PRIORITY (nice to have)
──────────────────────────────────────────────────────────
${results.filter(r => r.severity === 'LOW').map(r =>
  `  [${r.category}] ${r.issue}\n  → ${r.detail}`
).join('\n\n') || '  None'}

──────────────────────────────────────────────────────────
Full JSON report: duplication-report.json
`;

  fs.writeFileSync(path.join(process.cwd(), 'duplication-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(process.cwd(), 'duplication-report.txt'), text);
  console.log(text);
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────

async function main() {
  console.log('🔍 Starting UniDeal Duplication Audit...\n');

  const allPaths = [
    ...walkDir(path.join(process.cwd(), 'app')),
    ...walkDir(path.join(process.cwd(), 'components')),
    ...walkDir(path.join(process.cwd(), 'lib')),
    ...walkDir(path.join(process.cwd(), 'context')),
  ];

  const files = readFiles(allPaths);
  console.log(`Scanning ${files.length} files...\n`);

  auditDuplicateComponents(files);
  auditDuplicateFunctions(files);
  auditDuplicateStyles(files);
  auditDuplicateFetches(files);
  auditSimilarFiles(files);
  auditUnusedImports(files);
  auditUIduplication(files);

  generateReport();
}

main().catch(console.error);
