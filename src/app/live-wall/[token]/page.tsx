import { LiveWallPlayer } from "@/features/event/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function LiveWallPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <LiveWallPlayer token={token} />;
}
