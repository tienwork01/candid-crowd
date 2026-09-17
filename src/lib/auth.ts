import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { dash } from "@better-auth/infra";
import { Pool } from "pg";
import { sendAuthEmail } from "@/lib/auth-email";

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

const database = new Pool({
  connectionString: dbUrl,
  ...(isCloudDb || process.env.NODE_ENV === "production"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

export const auth = betterAuth({
  database,
  secret: required("BETTER_AUTH_SECRET"),
  baseURL: required("BETTER_AUTH_URL"),
  trustedOrigins: origins(required("BETTER_AUTH_TRUSTED_ORIGINS")),

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
