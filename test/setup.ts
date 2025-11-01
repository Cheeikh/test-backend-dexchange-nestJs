import { execSync } from 'child_process';

// Set test database URL from environment or use default test database
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

// Global setup before all tests
beforeAll(() => {
  // Push Prisma schema to test database
  try {
    execSync('pnpm prisma db push --skip-generate --accept-data-loss', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
      },
      stdio: 'inherit',
    });
    console.log('✓ Test database schema pushed successfully');
  } catch (error) {
    console.error('✗ Failed to push test database schema:', error);
    throw error;
  }
});

// Global teardown after all tests
afterAll(() => {
  // Optionally clean up test data or drop test database
  // This can be extended based on your needs
  console.log('✓ Test cleanup completed');
});
