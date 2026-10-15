import "dotenv/config";

// Redirect the application database to the dedicated test database so that
// tests only ever operate on throwaway data.
process.env.VITEST = "true";
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
