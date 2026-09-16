import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const dbUrl = process.env.BETTER_AUTH_DATABASE_URL || "";
  const maskedDbUrl = dbUrl.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");

  const checks = {
    hasDatabaseUrl: Boolean(dbUrl),
    maskedDbUrl,
    hasSecret: Boolean(process.env.BETTER_AUTH_SECRET),
    hasApiKey: Boolean(process.env.BETTER_AUTH_API_KEY),
    betterAuthUrl:
      process.env.BETTER_AUTH_URL || "default: https://candidcrowd.life",
    databaseConnected: false,
    dbTables: [] as string[],
    error: null as string | null,
  };

  if (!dbUrl) {
    checks.error = "BETTER_AUTH_DATABASE_URL is not configured";

    return NextResponse.json(checks, { status: 500 });
  }

  try {
    const isCloudDb =
      dbUrl.includes("neon.tech") ||
      dbUrl.includes("supabase.co") ||
      dbUrl.includes("pooler.supabase.com") ||
      dbUrl.includes("amazonaws.com") ||
      dbUrl.includes("sslmode=require");

    const pool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 5000,
      ...(isCloudDb || process.env.NODE_ENV === "production"
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
    });

    const client = await pool.connect();

    checks.databaseConnected = true;

    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name IN ('user', 'session', 'account', 'verification', 'rateLimit')",
    );

    checks.dbTables = res.rows.map((r: { table_name: string }) => r.table_name);
    client.release();
    await pool.end();
  } catch (err: unknown) {
    checks.error = err instanceof Error ? err.message : String(err);
  }

  const isHealthy = checks.databaseConnected && checks.dbTables.length >= 4;

  return NextResponse.json(checks, { status: isHealthy ? 200 : 500 });
}
