import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CandidCrowd — Shared Event Memories",
    short_name: "CandidCrowd",
    description:
      "Get the photos your guests already take. Instant event photo sharing with no app install required.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f2",
    theme_color: "#46533a",
    orientation: "portrait-primary",
    categories: ["photo", "events", "social", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Create Event",
        url: "/events/new",
        description: "Create a new event and get your QR code",
      },
      {
        name: "My Events",
        url: "/events",
        description: "View and manage your events",
      },
    ],
  };
}
