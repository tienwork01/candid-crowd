import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "You must be signed in to perform this action.",
        },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const newPassword = body?.newPassword;

    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 },
      );
    }

    await auth.api.setPassword({
      body: { newPassword },
      headers: reqHeaders,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[SET_PASSWORD_ERROR]", error);

    const err = error as {
      status?: number;
      statusCode?: number;
      body?: { code?: string; message?: string };
      code?: string;
      message?: string;
    };

    const status = err?.status || err?.statusCode || 500;
    const code = err?.body?.code || err?.code || "SERVER_ERROR";
    const message =
      err?.body?.message ||
      err?.message ||
      "Failed to set password. Please try again.";

    return NextResponse.json(
      { error: code, message },
      {
        status:
          typeof status === "number" && status >= 400 && status < 600
            ? status
            : 500,
      },
    );
  }
}
