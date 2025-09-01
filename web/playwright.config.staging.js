import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for staging environment
 * Tests against fully containerized environment with PostgreSQL
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 90 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 15000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 2,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 2,
  /* Reporter to use. */
  reporter: [
    ['html', { outputFolder: 'test-results/staging-html-report' }],
    ['json', { outputFile: 'test-results/staging-results.json' }],
    ['junit', { outputFile: 'test-results/staging-results.xml' }]
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Maximum time each action such as `click()` can take. */
    actionTimeout: 20000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:80',
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
      name: 'chromium-staging',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: ['**/integration/**/*.spec.js', '**/e2e/**/*.spec.js'],
    },
    {
      name: 'firefox-staging',
      use: {
        ...devices['Desktop Firefox'],
      },
      testMatch: ['**/integration/**/*.spec.js'],
    },
  ],

  /* Folder for test artifacts */
  outputDir: 'test-results/staging-artifacts',

  /* Global setup and teardown */
  globalSetup: './e2e/setup/global-setup-staging.js',
  globalTeardown: './e2e/setup/global-teardown-staging.js',

  /* Run containerized services before starting the tests */
  webServer: [
    {
      command: 'docker-compose -f ../docker-compose.staging.yml up -d',
      port: 80,
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000, // 5 minutes for full stack startup
      env: {
        NODE_ENV: 'staging'
      }
    }
  ],
})
