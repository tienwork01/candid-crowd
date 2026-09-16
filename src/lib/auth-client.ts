"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, jwtClient } from "better-auth/client/plugins";
import { dashClient } from "@better-auth/infra/client";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [jwtClient(), inferAdditionalFields<typeof auth>(), dashClient()],
});
