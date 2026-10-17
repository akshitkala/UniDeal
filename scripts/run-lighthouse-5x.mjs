import { execSync } from 'child_process';
import fs from 'fs';

console.log('Running Lighthouse 5 mobile passes on http://localhost:3000/browse ...');

const runs = [];

for (let i = 1; i <= 5; i++) {
  const outputPath = `checklist_report/lighthouse/browse-mobile-run${i}.json`;
  console.log(`Starting pass ${i}/5...`);
  try {
    execSync(
      `npx -y lighthouse http://localhost:3000/browse --chrome-flags="--headless" --output=json --output-path=${outputPath} --form-factor=mobile --screenEmulation.mobile=true`,
      { stdio: 'inherit' }
    );
    const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    const lcp = data.audits['largest-contentful-paint'].numericValue;
    const cls = data.audits['cumulative-layout-shift'].numericValue;
    const perf = data.categories.performance.score * 100;
    runs.push({ run: i, lcp: Math.round(lcp), cls: parseFloat(cls.toFixed(4)), perf: Math.round(perf) });
    console.log(`Pass ${i} complete:`, runs[runs.length - 1]);
  } catch (err) {
    console.error(`Pass ${i} failed:`, err);
  }
}

// Compute median
runs.sort((a, b) => a.lcp - b.lcp);
const medianIndex = Math.floor(runs.length / 2);
const median = runs[medianIndex];

console.log('\n==============================');
console.log('LIGHTHOUSE 5-RUN SUMMARY');
console.log('==============================');
console.log('Runs (sorted by LCP):', runs);
console.log('Median Run:', median);

fs.writeFileSync(
  'checklist_report/lighthouse/browse-5runs-summary.json',
  JSON.stringify({ runs, median }, null, 2)
);
