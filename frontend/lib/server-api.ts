/**
 * Server-component variants of the API client. Forwards the request's
 * gf_session cookie via the Cookie header so the backend session check
 * works from a server-side fetch.
 */
import { cookies } from "next/headers";

export function sessionCookieHeader(): string | undefined {
  const store = cookies();
  const c = store.get("gf_session");
  return c ? `gf_session=${c.value}` : undefined;
}
