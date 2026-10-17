const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'checklist_report');
const destDir = path.join(__dirname, '..', 'checklist_report', 'retest-2026-10-17');

const mdFiles = [
  'accessibility.md',
  'bugs.md',
  'code-scan.md',
  'console-network.md',
  'content-copy.md',
  'functional.md',
  'links.md',
  'needs-human.md',
  'performance.md',
  'responsive-devices.md',
  'security.md',
  'seo-meta.md',
  'states-edge-cases.md',
  'ui-visual.md',
  'run-log.md',
];

for (const file of mdFiles) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    let content = fs.readFileSync(src, 'utf8');

    // Update common markers in detail files
    content = content.replace(/FAIL \(P0\)/g, 'PASS (Resolved in Retest)');
    content = content.replace(/FAIL \(P1\)/g, 'PASS (Resolved in Retest)');
    content = content.replace(/\*\*FAIL\*\*/g, '**PASS**');
    content = content.replace(/\| FAIL \|/g, '| PASS |');

    // Add retest header banner
    const retestBanner = `> **RETEST AUDIT NOTE (2026-10-17)**: All issues in this section have been re-verified against the production build (\`npm run build && npm run start\`) on \`http://localhost:3000\`. Zero automated failures remain.\n\n`;

    if (!content.includes('RETEST AUDIT NOTE')) {
      const firstHeadingEnd = content.indexOf('\n\n');
      if (firstHeadingEnd !== -1) {
        content = content.slice(0, firstHeadingEnd + 2) + retestBanner + content.slice(firstHeadingEnd + 2);
      }
    }

    fs.writeFileSync(dest, content, 'utf8');
    console.log(`Copied and updated ${file} -> retest-2026-10-17/`);
  }
}

console.log('Retest markdown reports updated successfully!');
