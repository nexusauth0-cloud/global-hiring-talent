import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { eq, sql } from "drizzle-orm";
import { db } from "../src/lib/db";
import { users } from "../src/db/schema";
import { hashPassword, validatePasswordStrength } from "../src/lib/auth/password";

async function main() {
  const argEmail = readArg("--email") ?? process.env.ADMIN_EMAIL;
  const argPassword = readArg("--password") ?? process.env.ADMIN_PASSWORD;

  let email = argEmail?.trim().toLowerCase();
  let password = argPassword;

  if (!email || !password) {
    const rl = createInterface({ input: stdin, output: stdout });
    if (!email) {
      email = (await rl.question("Admin email: ")).trim().toLowerCase();
    }
    if (!password) {
      password = await rl.question("Admin password (input hidden in real terminal): ");
    }
    rl.close();
  }

  if (!email || !email.includes("@")) {
    console.error("A valid email is required.");
    process.exit(1);
  }

  const strength = validatePasswordStrength(password ?? "");
  if (!strength.ok) {
    console.error(`Weak password: ${strength.reason}`);
    process.exit(1);
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(sql`lower(${users.email})`, email))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(users)
      .set({ role: "admin", passwordHash: await hashPassword(password!), isActive: true })
      .where(eq(users.id, existing[0].id));
    console.log(`Promoted existing user ${email} to admin and reset password.`);
    process.exit(0);
  }

  await db.insert(users).values({
    email,
    passwordHash: await hashPassword(password!),
    role: "admin",
    emailVerifiedAt: new Date(),
  });

  console.log(`Created admin account ${email}.`);
  process.exit(0);
}

function readArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  const inline = process.argv.find((a) => a.startsWith(`${flag}=`));
  return inline ? inline.slice(flag.length + 1) : undefined;
}

main().catch((err) => {
  console.error("Failed to create admin:", err instanceof Error ? err.message : err);
  process.exit(1);
});
