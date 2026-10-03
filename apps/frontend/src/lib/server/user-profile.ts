import { zUserRead } from "@/lib/types/api/zod.gen";
import type { UserRead } from "@/lib/types/api/types.gen";

/**
 * Public profile returned to the browser. No tokens, roles, or IdP internals.
 */
export type PublicUserProfile = Pick<
  UserRead,
  | "id"
  | "email"
  | "full_name"
  | "username"
  | "phone_number"
  | "is_active"
  | "tenant_id"
  | "tenant_name"
  | "tenant_tier"
  | "created_at"
>;

export function toPublicUserProfile(raw: unknown): {
  ok: true;
  data: PublicUserProfile;
} | {
  ok: false;
  status: number;
  detail: string;
} {
  const parsed = zUserRead.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, status: 502, detail: "Invalid user profile from API" };
  }
  const u = parsed.data;
  if (!u.is_active) {
    return { ok: false, status: 403, detail: "Account is disabled" };
  }
  return {
    ok: true,
    data: {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      username: u.username ?? "",
      phone_number: u.phone_number ?? null,
      is_active: u.is_active,
      tenant_id: u.tenant_id ?? null,
      tenant_name: u.tenant_name ?? null,
      tenant_tier: u.tenant_tier ?? null,
      created_at: u.created_at ?? null,
    },
  };
}
