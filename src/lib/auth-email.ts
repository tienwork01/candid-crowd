import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/config";

export type AuthEmailType = "verification" | "reset-password";

export type Message = {
  to: string;
  subject: string;
  heading: string;
  text: string;
  action: string;
  url: string;
  userName?: string;
  subtext?: string;
  previewText?: string;
  templateType?: AuthEmailType;
};

function required(name: string): string {
  const value = process.env[name];

  if (!value)
    throw new Error(`${name} is required to send authentication email`);

  return value;
}

function escapeHTML(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

const templateCache = new Map<AuthEmailType, string>();

function loadEmailTemplate(type: AuthEmailType): string {
  if (process.env.NODE_ENV === "production" && templateCache.has(type)) {
    return templateCache.get(type)!;
  }

  const fileName =
    type === "reset-password"
      ? "reset-password-email.html"
      : "verification-email.html";
  const filePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "emails",
    fileName,
  );

  const template = fs.readFileSync(filePath, "utf-8");

  if (process.env.NODE_ENV === "production") {
    templateCache.set(type, template);
  }

  return template;
}

function renderTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => {
    return variables[key] ?? "";
  });
}

export async function sendAuthEmail(message: Message): Promise<void> {
  const transport = nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: required("SMTP_PASSWORD") }
      : undefined,
  });

  const heading = escapeHTML(message.heading);
  const body = escapeHTML(message.text);
  const action = escapeHTML(message.action);
  const url = escapeHTML(message.url);
  const userName = message.userName ? escapeHTML(message.userName) : null;
  const subtext = message.subtext ? escapeHTML(message.subtext) : null;
  const preview = escapeHTML(message.previewText || message.heading);
  const templateType = message.templateType || "verification";

  const greetingHtml = userName
    ? `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #606458; font-weight: 500;">Hello ${userName},</p>`
    : "";

  const subtextHtml = subtext
    ? `<p style="margin: 20px 0 0 0; font-size: 13px; line-height: 1.6; color: #767a6d; text-align: center;">${subtext}</p>`
    : "";

  const rawTemplate = loadEmailTemplate(templateType);

  const appName = process.env.NEXT_PUBLIC_APP_NAME || siteConfig.name;
  const appTagline = process.env.NEXT_PUBLIC_APP_TAGLINE || siteConfig.tagline;
  const appDescription =
    process.env.NEXT_PUBLIC_APP_DESCRIPTION || siteConfig.description;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    siteConfig.appUrl;
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || siteConfig.supportEmail;

  const html = renderTemplate(rawTemplate, {
    SUBJECT: escapeHTML(message.subject),
    PREVIEW_TEXT: preview,
    GREETING: greetingHtml,
    HEADING: heading,
    BODY: body,
    ACTION_TEXT: action,
    ACTION_URL: url,
    SUBTEXT: subtextHtml,
    APP_NAME: escapeHTML(appName),
    APP_TAGLINE: escapeHTML(appTagline),
    APP_DESCRIPTION: escapeHTML(appDescription),
    APP_URL: escapeHTML(appUrl),
    SUPPORT_EMAIL: escapeHTML(supportEmail),
    YEAR: new Date().getFullYear().toString(),
  });

  const plainGreeting = userName ? `Hello ${userName},\n\n` : "";
  const plainSubtext = subtext ? `\n\n${subtext}` : "";

  await transport.sendMail({
    from: required("EMAIL_FROM"),
    to: message.to,
    subject: message.subject,
    text: `${plainGreeting}${message.heading}\n\n${message.text}\n\n${message.action}: ${message.url}${plainSubtext}\n\nIf you did not request this email, you can safely ignore it.`,
    html,
  });
}
