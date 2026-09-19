import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth, authDbPool } from "@/lib/auth";

export async function POST() {
  return handleSoftDelete();
}

export async function DELETE() {
  return handleSoftDelete();
}

async function handleSoftDelete() {
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

    const userId = session.user.id;

    // 1. Soft delete: update "user" table to set deletedAt timestamp
    await authDbPool.query(
      'UPDATE "user" SET "deletedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1',
      [userId],
    );

    // 2. Also update "users" table if corresponding row exists
    try {
      await authDbPool.query(
        'UPDATE "users" SET "deleted_at" = NOW(), "updated_at" = NOW() WHERE "better_auth_user_id" = $1',
        [userId],
      );
    } catch {
      // Ignore if users table has no matching row
    }

    // 3. Invalidate/delete all active sessions of this user so their token/session cannot be reused
    await authDbPool.query('DELETE FROM "session" WHERE "userId" = $1', [
      userId,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SOFT_DELETE_USER_ERROR]", error);

    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: "Failed to delete account. Please try again.",
      },
      { status: 500 },
    );
  }
}
