module.exports = {
  token: process.env.TESTIM_TOKEN || 'PAK-mj3abF+19IrmL/-KS3w7wxVS9JJ9FAKQkFjIvY0HjQ/v1WtO959qGRvM5jgG64AEZN8+VTl+8lMg0CQAy',
  project: "CareAI",
  "grid-name": "Testim-Grid",
  "base-url": "http://localhost:19006",
  "test-plan": "CareAI Tests",
  "suite-timeout": 30,
  "test-timeout": 5,
  "failure-retries": 2,
  viewport: {
    width: 1280,
    height: 800
  },
  "before-test": async (test, context) => {
    // Setup test environment
    await context.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  },
  "after-test": async (test, context) => {
    // Cleanup after test
    if (test.status === 'failed') {
      await context.page.screenshot({
        path: `./test-results/${test.name}-failure.png`
      });
    }
  }
};