import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { env } from "@/lib/config";

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function createClient() {
  return postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === "production" ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: env.DATABASE_URL.includes("sslmode=require") ? "require" : undefined,
    onnotice: () => {},
  });
}

const client = globalThis.__pgClient ?? createClient();
if (env.NODE_ENV !== "production") {
  globalThis.__pgClient = client;
}

export const db =
  globalThis.__db ?? drizzle(client, { schema });
if (env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

export type Db = typeof db;
export { schema };
