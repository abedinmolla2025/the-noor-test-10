import { detectPlatform } from "@/lib/ads";

export type LayoutPlatform = "web" | "app";

export async function detectLayoutPlatform(): Promise<LayoutPlatform> {
  const p = await detectPlatform();
  return p === "web" ? "web" : "app";
}
