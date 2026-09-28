import { LiveWallLaunchScreen } from "@/features/event/components";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function LiveWallLaunchingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <LiveWallLaunchScreen failed={Boolean(error)} />;
}
