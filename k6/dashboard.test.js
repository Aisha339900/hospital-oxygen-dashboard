import { browser } from 'k6/browser';
import { check } from 'k6';

export const options = {
  thresholds: {
    checks: ['rate>0.95'],
    browser_http_req_failed: ['rate<0.05'],
    browser_http_req_duration: ['p(95)<3000'],
    browser_web_vital_lcp: ['p(95)<7000'],
    browser_web_vital_cls: ['p(95)<0.1'],
    browser_web_vital_fcp: ['p(95)<4000'],
  },
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 2,
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export default async function () {
  const page = await browser.newPage();

  try {
    const response = await page.goto('https://hospital-oxygen-dashboard.vercel.app', {
      waitUntil: 'networkidle',
    });

    check(response, {
      'page responded successfully': (r) =>
        r && r.status() >= 200 && r.status() < 400,
    });

    // wait for full rendering (important for web vitals measurement)
    await page.waitForSelector('body');
    await page.waitForTimeout(3000);

  } finally {
    await page.close();
  }
}