"use server";

import { cookies } from "next/headers";
import { isAppLocale, localeCookieName, type AppLocale } from "./locales";

export async function setUserLocale(locale: AppLocale): Promise<void> {
  if (!isAppLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
