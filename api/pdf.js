// Vercel serverless function: GET /api/pdf?url=<encoded url>
// Renders the page in headless Chromium and returns the PDF.
//
// Optional query params:
//   format: A4 (default) | Letter
//   landscape: 1 to enable landscape
//   timeout: ms (default 30000)
//
// Allowed origins are restricted to elzinko.fr, elzinko.github.io and localhost for safety.

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

const ALLOWED_HOST_PATTERNS = [
  /^https?:\/\/(www\.)?elzinko\.fr\//,
  /^https:\/\/elzinko\.github\.io\//,
  /^https?:\/\/localhost(:\d+)?\//,
  /^https?:\/\/127\.0\.0\.1(:\d+)?\//,
];

function isAllowed(target) {
  return ALLOWED_HOST_PATTERNS.some((re) => re.test(target));
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const target = req.query.url;
  if (!target || typeof target !== 'string') {
    res.status(400).json({ error: "Missing required 'url' query parameter" });
    return;
  }
  if (!isAllowed(target)) {
    res.status(403).json({ error: 'URL host not allowed', target });
    return;
  }

  const format = (req.query.format || 'A4').toString();
  const landscape = req.query.landscape === '1' || req.query.landscape === 'true';
  const timeout = Math.min(parseInt(req.query.timeout, 10) || 30000, 55000);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    await page.goto(target, { waitUntil: 'networkidle0', timeout });
    const pdf = await page.pdf({
      format,
      landscape,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    });
    // puppeteer v23 returns Uint8Array; wrap in Buffer so res.send emits binary
    const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(200).end(pdfBuffer);
  } catch (err) {
    console.error('PDF generation failed', err);
    res.status(500).json({ error: 'PDF generation failed', message: err.message });
  } finally {
    if (browser) { try { await browser.close(); } catch (_) {} }
  }
};
