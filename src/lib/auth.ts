import dns from "node:dns";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { dash } from "@better-auth/infra";
import { Pool } from "pg";
import { sendAuthEmail } from "@/lib/auth-email";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

function required(name: string): string {
  const value = process.env[name];

  if (!value) throw new Error(`${name} is required`);

  return value;
}

function origins(value: string): string[] {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const dbUrl = required("BETTER_AUTH_DATABASE_URL");
const isCloudDb =
  dbUrl.includes("neon.tech") ||
  dbUrl.includes("supabase.co") ||
  dbUrl.includes("pooler.supabase.com") ||
  dbUrl.includes("amazonaws.com") ||
  dbUrl.includes("sslmode=require");

const globalForAuth = globalThis as unknown as {
  betterAuthDbPool?: Pool;
};

const database =
  globalForAuth.betterAuthDbPool ??
  new Pool({
    connectionString: dbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    ...(isCloudDb || process.env.NODE_ENV === "production"
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
    lookup: (
      hostname: string,
      options: unknown,
      callback: (
        err: NodeJS.ErrnoException | null,
        address: string,
        family: number,
      ) => void,
    ) => {
      if (typeof options === "function") {
        return dns.lookup(
          hostname,
          { family: 4 },
          options as (
            err: NodeJS.ErrnoException | null,
            address: string,
            family: number,
          ) => void,
        );
      }

      const lookupOpts =
        typeof options === "object" && options !== null ? options : {};

      return dns.lookup(hostname, { ...lookupOpts, family: 4 }, callback);
    },
  } as unknown as import("pg").PoolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForAuth.betterAuthDbPool = database;

  // Warm up Neon connection on startup so initial auth calls do not cold-start
  database.query("SELECT 1").catch(() => {});

  // Periodic heartbeat to prevent serverless Neon idle sleep during local development
  const KEEP_ALIVE_INTERVAL = 2.5 * 60 * 1000;
  const globalHeartbeat = globalThis as unknown as {
    __neonHeartbeat?: NodeJS.Timeout;
  };

  if (!globalHeartbeat.__neonHeartbeat) {
    globalHeartbeat.__neonHeartbeat = setInterval(() => {
      database.query("SELECT 1").catch(() => {});
    }, KEEP_ALIVE_INTERVAL);

    if (globalHeartbeat.__neonHeartbeat.unref) {
      globalHeartbeat.__neonHeartbeat.unref();
    }
  }
}

function isDevOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const host = url.hostname;

    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.")
    );
  } catch {
    return false;
  }
}

export const auth = betterAuth({
  database,
  secret: required("BETTER_AUTH_SECRET"),
  baseURL: required("BETTER_AUTH_URL"),
  trustedOrigins: (request) => {
    const configured = origins(required("BETTER_AUTH_TRUSTED_ORIGINS"));

    if (process.env.NODE_ENV !== "production" && request?.headers) {
      const origin =
        typeof request.headers.get === "function"
          ? request.headers.get("origin")
          : (request.headers as unknown as Record<string, string>)["origin"];

      if (origin && isDevOrigin(origin)) {
        return Array.from(new Set([...configured, origin]));
      }
    }

    return configured;
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 300, max: 5 },
      "/send-verification-email": { window: 300, max: 5 },
    },
  },
  verification: { storeIdentifier: "hashed" },
  account: { encryptOAuthTokens: true },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  user: {
    additionalFields: {
      termsVersion: { type: "string", required: true, input: true },
      privacyVersion: { type: "string", required: true, input: true },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Reset your CandidCrowd password",
        heading: "Choose a new password",
        text: "Use the secure link below to reset your password.",
        action: "Reset password",
        url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Verify your CandidCrowd email",
        heading: "One last step",
        text: "Verify your email to start collecting memories.",
        action: "Verify email",
        url,
      });
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  advanced: {
    database: { joins: true },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  plugins: [
    dash(),
    jwt({
      jwks: {
        keyPairConfig: { alg: "EdDSA", crv: "Ed25519" },
        rotationInterval: 60 * 60 * 24 * 30,
        gracePeriod: 60 * 60 * 24 * 30,
      },
      jwt: {
        issuer: required("BETTER_AUTH_JWT_ISSUER"),
        audience: required("BETTER_AUTH_JWT_AUDIENCE"),
        expirationTime: process.env.BETTER_AUTH_JWT_EXPIRATION || "10m",
        definePayload: ({ user }) => ({
          email: user.email,
          name: user.name,
          email_verified: user.emailVerified,
          terms_version: user.termsVersion,
          privacy_version: user.privacyVersion,
        }),
      },
    }),
  ],
});
