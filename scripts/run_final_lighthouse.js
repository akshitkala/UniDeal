const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targets = [
  { name: 'home-mobile', url: 'http://localhost:3000/' },
  { name: 'browse-mobile', url: 'http://localhost:3000/browse' },
  { name: 'listing-mobile', url: 'http://localhost:3000/listing/engineering-mathematics-textbook-eAJiY' },
];

const outDir = path.join(__dirname, '..', 'checklist_report', 'final-regression-2026-10-17', 'lighthouse');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function getMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const summaryResults = {};

for (const target of targets) {
  console.log(`\n=== Running 3 Lighthouse Mobile Audits for ${target.name} ===`);
  const runs = [];

  for (let run = 1; run <= 3; run++) {
    const jsonPath = path.join(outDir, `${target.name}-run${run}.json`);
    console.log(`[Run ${run}/3] Auditing ${target.url}...`);

    const cmd = `npx --yes lighthouse "${target.url}" --output=json --output-path="${jsonPath}" --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox"`;

    try {
      execSync(cmd, { stdio: 'pipe' });
      if (fs.existsSync(jsonPath)) {
        const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const lcp = report.audits['largest-contentful-paint']?.numericValue || 0;
        const cls = report.audits['cumulative-layout-shift']?.numericValue || 0;
        const tbt = report.audits['total-blocking-time']?.numericValue || 0;
        const perf = Math.round((report.categories.performance?.score || 0) * 100);
        const a11y = Math.round((report.categories.accessibility?.score || 0) * 100);
        const bp = Math.round((report.categories['best-practices']?.score || 0) * 100);
        const seo = Math.round((report.categories.seo?.score || 0) * 100);

        runs.push({ lcp, cls, tbt, perf, a11y, bp, seo });
        console.log(`  Run ${run}: Perf=${perf}, A11y=${a11y}, BP=${bp}, SEO=${seo} | LCP=${(lcp/1000).toFixed(2)}s, CLS=${cls.toFixed(3)}, TBT=${Math.round(tbt)}ms`);
      }
    } catch (err) {
      console.error(`  Run ${run} error:`, err.message);
    }
  }

  if (runs.length > 0) {
    summaryResults[target.name] = {
      runsCount: runs.length,
      medianPerf: getMedian(runs.map(r => r.perf)),
      medianA11y: getMedian(runs.map(r => r.a11y)),
      medianBp: getMedian(runs.map(r => r.bp)),
      medianSeo: getMedian(runs.map(r => r.seo)),
      medianLcp: (getMedian(runs.map(r => r.lcp)) / 1000).toFixed(2) + 's',
      medianCls: getMedian(runs.map(r => r.cls)).toFixed(3),
      medianTbt: Math.round(getMedian(runs.map(r => r.tbt))) + 'ms',
      rawRuns: runs
    };
  }
}

fs.writeFileSync(path.join(outDir, 'lighthouse-summary.json'), JSON.stringify(summaryResults, null, 2), 'utf8');
console.log('\n=== Lighthouse 3-Run Median Summary ===');
console.table(Object.keys(summaryResults).map(k => ({
  Target: k,
  'Perf': summaryResults[k].medianPerf,
  'A11y': summaryResults[k].medianA11y,
  'BestPractices': summaryResults[k].medianBp,
  'SEO': summaryResults[k].medianSeo,
  'LCP': summaryResults[k].medianLcp,
  'CLS': summaryResults[k].medianCls,
  'TBT': summaryResults[k].medianTbt,
})));
