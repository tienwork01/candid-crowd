import nodemailer from "nodemailer";

type Message = {
  to: string;
  subject: string;
  heading: string;
  text: string;
  action: string;
  url: string;
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

  await transport.sendMail({
    from: required("EMAIL_FROM"),
    to: message.to,
    subject: message.subject,
    text: `${message.heading}\n\n${message.text}\n\n${message.url}`,
    html: `<main style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1>${heading}</h1><p>${body}</p><p><a href="${url}" style="display:inline-block;background:#1f2923;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">${action}</a></p><p style="font-size:12px;color:#66706a">If you did not request this email, you can ignore it.</p></main>`,
  });
}
