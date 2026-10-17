import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: __dirname,
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: './checklist_report/playwright-results.json' }],
    ['html', { outputFolder: './checklist_report/playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chrome-desktop-1440',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chrome-laptop-1024',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'safari-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'ipad',
      use: {
        ...devices['iPad (gen 7)'],
      },
    },
    {
      name: 'iphone-se-375',
      use: {
        ...devices['iPhone SE'],
      },
    },
    {
      name: 'iphone-14',
      use: {
        ...devices['iPhone 14'],
      },
    },
    {
      name: 'android-pixel-7',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'android-small-360',
      use: {
        ...devices['Galaxy S9+'],
      },
    },
  ],
});
