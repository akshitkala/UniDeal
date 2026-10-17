const fs = require('fs');
const path = require('path');

function extractMeta(html, property) {
  const reg1 = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i');
  const reg2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
  const m1 = html.match(reg1);
  if (m1) return m1[1];
  const m2 = html.match(reg2);
  if (m2) return m2[1];
  return null;
}

function extractCanonical(html) {
  const reg = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i;
  const m = html.match(reg);
  return m ? m[1] : null;
}

async function testMetadata() {
  console.log('=== METADATA & STATIC ASSETS HTTP STATUS AUDIT ===');
  const urls = [
    'http://localhost:3000/favicon.ico',
    'http://localhost:3000/robots.txt',
    'http://localhost:3000/sitemap.xml',
    'http://localhost:3000/manifest.webmanifest'
  ];

  const assetStatuses = {};
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const name = url.split('/').pop();
      assetStatuses[name] = res.status;
      console.log(`${url} -> HTTP ${res.status} (${res.headers.get('content-type')})`);
    } catch (err) {
      console.error(`${url} -> ERROR: ${err.message}`);
    }
  }

  console.log('\n=== OPENGRAPH METADATA INSPECTION (HOME) ===');
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();

  const homeOgUrl = extractMeta(homeHtml, 'og:url');
  const homeOgImage = extractMeta(homeHtml, 'og:image');
  const homeCanonical = extractCanonical(homeHtml);

  console.log('Home og:url:', homeOgUrl);
  console.log('Home og:image:', homeOgImage);
  console.log('Home canonical:', homeCanonical);

  console.log('\n=== OPENGRAPH METADATA INSPECTION (LISTING DETAIL) ===');
  const listRes = await fetch('http://localhost:3000/api/listings');
  const listJson = await listRes.json();
  const slug = listJson.data.listings[0].slug;

  const detailRes = await fetch(`http://localhost:3000/listing/${slug}`);
  const detailHtml = await detailRes.text();

  const detailOgUrl = extractMeta(detailHtml, 'og:url');
  const detailOgImage = extractMeta(detailHtml, 'og:image');
  const detailCanonical = extractCanonical(detailHtml);

  console.log(`Listing (${slug}) og:url:`, detailOgUrl);
  console.log(`Listing (${slug}) og:image:`, detailOgImage);
  console.log(`Listing (${slug}) canonical:`, detailCanonical);

  console.log('\n--- LOCALHOST CHECK ---');
  const checks = [
    { target: 'Home og:url', value: homeOgUrl },
    { target: 'Home og:image', value: homeOgImage },
    { target: 'Listing og:url', value: detailOgUrl },
    { target: 'Listing og:image', value: detailOgImage },
  ];

  let hasLocalhost = false;
  checks.forEach(c => {
    const isLocalhost = (c.value || '').includes('localhost') || (c.value || '').includes('127.0.0.1');
    console.log(`${c.target}: ${c.value} -> ${isLocalhost ? 'CONTAINS LOCALHOST (FLAG)' : 'CLEAN (No localhost)'}`);
    if (isLocalhost) hasLocalhost = true;
  });

  const summary = {
    testedAt: new Date().toISOString(),
    assets: assetStatuses,
    home: { ogUrl: homeOgUrl, ogImage: homeOgImage, canonical: homeCanonical },
    listing: { slug, ogUrl: detailOgUrl, ogImage: detailOgImage, canonical: detailCanonical },
    containsLocalhost: hasLocalhost
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'checklist_report', 'retest-2026-10-17b', 'metadata-audit.json'),
    JSON.stringify(summary, null, 2),
    'utf8'
  );
}

testMetadata().catch(console.error);
