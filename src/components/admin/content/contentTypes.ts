export type AdminContentType = "name" | "dua" | "hadith";

export const ADMIN_CONTENT_TYPE_OPTIONS: Array<{
  value: AdminContentType;
  label: string;
  description?: string;
}> = [
  { value: "name", label: "Islamic Names" },
  { value: "dua", label: "Dua" },
  { value: "hadith", label: "Hadith", description: "Coming soon" },
];

export const adminContentTypeLabel = (t: AdminContentType) => {
  const hit = ADMIN_CONTENT_TYPE_OPTIONS.find((o) => o.value === t);
  return hit?.label ?? t;
};
