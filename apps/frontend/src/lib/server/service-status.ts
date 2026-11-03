export type PublicServiceStatus = {
  slug: string;
  name: string;
  status: "connected" | "trial" | "not_connected";
};

/** Validate and filter the backend response before exposing it to browser code. */
export function toPublicServiceStatuses(value: unknown): PublicServiceStatus[] | null {
  if (!Array.isArray(value)) return null;

  const rows: PublicServiceStatus[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (
      typeof row.slug !== "string" ||
      typeof row.name !== "string" ||
      (row.status !== "connected" && row.status !== "trial" && row.status !== "not_connected")
    ) {
      return null;
    }
    // Do not expose external organization IDs or product audiences to browser code.
    rows.push({ slug: row.slug, name: row.name, status: row.status });
  }
  return rows;
}
