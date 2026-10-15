import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url =
    process.env.MIGRATE_TARGET === "test"
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL;

  if (!url) {
    console.error("DATABASE_URL is not set. Cannot run migrations.");
    process.exit(1);
  }

  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client);

  console.log(`Applying migrations to ${describe(url)} ...`);
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Migrations applied successfully.");
  await client.end();
}

function describe(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}:${u.port || "5432"}${u.pathname}`;
  } catch {
    return "<database>";
  }
}

main().catch((err) => {
  console.error("Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
