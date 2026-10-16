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

  const client = postgres(url, {
    max: 1,
    connect_timeout: 60,
    onnotice: () => {},
  });
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

// Collect every known secret so we can guarantee none is ever printed.
function collectSecrets(): string[] {
  const secrets: string[] = [];
  for (const value of [
    process.env.DATABASE_URL,
    process.env.TEST_DATABASE_URL,
  ]) {
    if (value) secrets.push(value);
    try {
      if (value) {
        const password = new URL(value).password;
        if (password) secrets.push(decodeURIComponent(password));
      }
    } catch {
      /* not a valid URL, ignore */
    }
  }
  return secrets;
}

function redact(input: string, secrets: string[]): string {
  let out = input;
  for (const secret of secrets) {
    if (secret && secret.length >= 3) out = out.split(secret).join("[redacted]");
  }
  // Catch any connection string that slipped through.
  return out.replace(/postgres(ql)?:\/\/[^\s"')]+/gi, "postgresql://[redacted]");
}

// PostgreSQL / postgres.js error attributes worth surfacing.
const PG_FIELDS = [
  "severity",
  "code",
  "detail",
  "hint",
  "position",
  "internalPosition",
  "internalQuery",
  "where",
  "schema",
  "table",
  "column",
  "dataType",
  "constraint",
  "routine",
  "file",
  "line",
] as const;

function reportError(err: unknown, secrets: string[]): void {
  console.error("Migration failed.");
  let current: unknown = err;
  for (let depth = 0; current != null && depth < 6; depth++) {
    const record = current as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name : "Error";
    const message =
      typeof record.message === "string" ? record.message : String(current);

    console.error(
      `\n[${depth === 0 ? "error" : `cause ${depth}`}] ${name}: ${redact(message, secrets)}`
    );

    for (const field of PG_FIELDS) {
      const value = record[field];
      if (value !== undefined && value !== null && value !== "") {
        console.error(`  ${field}: ${redact(String(value), secrets)}`);
      }
    }

    if (typeof record.stack === "string") {
      const stack = redact(record.stack, secrets)
        .split("\n")
        .slice(1, 6)
        .map((line) => `    ${line.trim()}`)
        .join("\n");
      if (stack) console.error(`  stack:\n${stack}`);
    }

    current = record.cause;
  }
}

main().catch((err) => {
  reportError(err, collectSecrets());
  process.exit(1);
});
