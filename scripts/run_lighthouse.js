const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targets = [
  { name: 'home-mobile', url: 'http://localhost:3000/', desktop: false },
  { name: 'home-desktop', url: 'http://localhost:3000/', desktop: true },
  { name: 'browse-mobile', url: 'http://localhost:3000/browse', desktop: false },
  { name: 'browse-desktop', url: 'http://localhost:3000/browse', desktop: true },
  { name: 'listing-mobile', url: 'http://localhost:3000/listing/chess-board-pieces-wooden-X7aPV', desktop: false },
  { name: 'listing-desktop', url: 'http://localhost:3000/listing/chess-board-pieces-wooden-X7aPV', desktop: true },
];

const outDir1 = path.join(__dirname, '..', 'checklist_report', 'lighthouse');
const outDir2 = path.join(__dirname, '..', 'checklist_report', 'retest-2026-10-17', 'lighthouse');

[outDir1, outDir2].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

console.log('Starting Lighthouse Audits on production server (localhost:3000)...');

for (const target of targets) {
  const file1 = path.join(outDir1, `${target.name}.json`);
  const file2 = path.join(outDir2, `${target.name}.json`);
  console.log(`Auditing ${target.name} (${target.url})...`);

  const presetFlag = target.desktop ? '--preset=desktop' : '';
  const cmd = `npx --yes lighthouse "${target.url}" --output=json --output-path="${file1}" ${presetFlag} --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
    if (fs.existsSync(file1)) {
      fs.copyFileSync(file1, file2);
      const report = JSON.parse(fs.readFileSync(file1, 'utf8'));
      const scores = {
        perf: Math.round((report.categories.performance?.score || 0) * 100),
        a11y: Math.round((report.categories.accessibility?.score || 0) * 100),
        bp: Math.round((report.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((report.categories.seo?.score || 0) * 100),
      };
      console.log(`✓ ${target.name} completed: Perf=${scores.perf}, A11y=${scores.a11y}, BestPractices=${scores.bp}, SEO=${scores.seo}`);
    }
  } catch (err) {
    console.error(`Error auditing ${target.name}:`, err.message);
  }
}

console.log('Lighthouse audits complete!');
