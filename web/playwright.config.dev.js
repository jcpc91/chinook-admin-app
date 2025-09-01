import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for development environment
 * Tests against containerized web frontend with local backend services
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 10000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. */
  reporter: [
    ['html', { outputFolder: 'test-results/dev-html-report' }],
    ['json', { outputFile: 'test-results/dev-results.json' }],
    ['junit', { outputFile: 'test-results/dev-results.xml' }]
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Maximum time each action such as `click()` can take. */
    actionTimeout: 15000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video recording */
    video: 'retain-on-failure',
    /* Run tests headless */
    headless: !!process.env.CI,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-dev',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: ['**/integration/**/*.spec.js', '**/e2e/**/*.spec.js'],
    },
    {
      name: 'firefox-dev',
      use: {
        ...devices['Desktop Firefox'],
      },
      testMatch: ['**/integration/**/*.spec.js'],
    },
  ],

  /* Folder for test artifacts */
  outputDir: 'test-results/dev-artifacts',

  /* Global setup and teardown */
  globalSetup: './e2e/setup/global-setup-dev.js',
  globalTeardown: './e2e/setup/global-teardown-dev.js',

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'docker-compose -f ../docker-compose.dev.yml up web',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        NODE_ENV: 'test'
      }
    }
  ],
})
