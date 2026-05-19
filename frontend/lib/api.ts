/**
 * Frontend API client.
 *
 * All calls go through the Phase 1/2 Rust/Axum backend. The base URL is
 * read from NEXT_PUBLIC_API_BASE_URL at build time and falls back to a
 * relative path so the Next.js host can proxy through /api/*.
 *
 * Auth: the backend sets a JWT in an httpOnly cookie (gf_session). The
 * browser stores and replays it automatically — never read or write the
 * cookie from JS.
 *
 * Some endpoints used by the dashboard do not yet exist on the backend.
 * They are marked with `BACKEND-NEEDED:` comments; calling them will
 * 404 until a follow-up backend task adds them. They are intentionally
 * defined here so the contract is clear and the frontend types compile.
 */

/**
 * Resolve the API base URL at request time.
 *
 * - In the browser, all requests go to "/api/*" so the Next.js rewrite in
 *   next.config.mjs proxies them to the backend; this keeps the cookie
 *   first-party (no CORS, no third-party cookie blocking).
 * - On the server (route handlers, server components), Next.js cannot
 *   proxy through itself, so we hit the backend directly using
 *   INTERNAL_API_URL (default http://localhost:8080).
 */
function apiBase(): string {
  if (typeof window !== "undefined") return "/api";
  return process.env.INTERNAL_API_URL ?? "http://localhost:8080";
}

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export type EventType =
  | "manufactured"
  | "inspected"
  | "shipped"
  | "sold"
  | "transferred";

export type AnchorStatus = "pending" | "confirmed";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  created_at: string;
}

export interface PublicProduct {
  id: string;
  brand_id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  external_ref: string | null;
  name: string;
  metadata: unknown | null;
  created_at: string;
}

export interface ProvenanceEvent {
  id: string;
  product_id: string;
  event_type: EventType;
  detail: unknown | null;
  recorded_at: string;
  anchor_batch_id: string | null;
}

export interface AnchorBatch {
  id: string;
  records_hash: string;
  tx_hash: string | null;
  block_number: number | null;
  status: AnchorStatus;
  anchored_at: string;
}

/**
 * Brand-scoped view of an anchor batch. The `brand_hash` field is a
 * SHA-256 over only this brand's events in the batch — the global
 * records_hash is intentionally not exposed.
 */
export interface BrandAnchorView {
  id: string;
  brand_hash: string;
  tx_hash: string | null;
  block_number: number | null;
  status: AnchorStatus;
  anchored_at: string;
}

export interface ApiKey {
  id: string;
  brand_id: string;
  label: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface MeResponse {
  user_id: string;
  brand_id: string;
  email: string;
  brand_name: string;
  brand_slug: string;
  custom_domain: string | null;
  role: UserRole;
}

export interface DashboardMetrics {
  product_count: number;
  event_count: number;
  last_anchor: BrandAnchorView | null;
  recent_events: ProvenanceEvent[];
}

export interface VerifyResponse {
  product: PublicProduct;
  brand: Brand;
  events: ProvenanceEvent[];
  latest_anchor: BrandAnchorView | null;
}

export interface CreateApiKeyResponse {
  id: string;
  key: string;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  cookieHeader?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // body wasn't JSON
    }
    throw new ApiError(res.status, message || res.statusText);
  }

  // Handle empty-body successes (e.g., 201 Created from /auth/register,
  // 200 OK from /auth/login — both set a cookie and return no JSON).
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// --- Auth ---

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  email: string;
  password: string;
  brand_name: string;
}

export async function login(body: LoginRequest): Promise<void> {
  await request<void>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function register(body: RegisterRequest): Promise<void> {
  await request<void>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function logout(): Promise<void> {
  await request<void>("/auth/logout", { method: "POST" });
}

export async function me(cookieHeader?: string): Promise<MeResponse> {
  return request<MeResponse>("/auth/me", {}, cookieHeader);
}

// --- Dashboard ---

// BACKEND-NEEDED: GET /v1/dashboard
export async function getDashboard(
  cookieHeader?: string,
): Promise<DashboardMetrics> {
  return request<DashboardMetrics>("/v1/dashboard", {}, cookieHeader);
}

// --- Products ---

// BACKEND-NEEDED: GET /v1/products?limit=&offset=
export async function listProducts(
  params: { limit?: number; offset?: number } = {},
  cookieHeader?: string,
): Promise<Product[]> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString() ? `?${search.toString()}` : "";
  return request<Product[]>(`/v1/products${qs}`, {}, cookieHeader);
}

export async function getProduct(
  id: string,
  cookieHeader?: string,
): Promise<Product> {
  return request<Product>(`/v1/products/${id}`, {}, cookieHeader);
}

export interface CreateProductRequest {
  name: string;
  external_ref?: string | null;
  metadata?: unknown | null;
}

export async function createProduct(
  body: CreateProductRequest,
): Promise<Product> {
  return request<Product>("/v1/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface BulkProductItem {
  name: string;
  external_ref?: string | null;
  metadata?: unknown | null;
}

export interface BulkFailure {
  index: number;
  reason: string;
}

export interface BulkProductResponse {
  created: number;
  products: Product[];
  failed: BulkFailure[];
}

export async function bulkImportJson(
  items: BulkProductItem[],
): Promise<BulkProductResponse> {
  return request<BulkProductResponse>("/v1/products/bulk", {
    method: "POST",
    body: JSON.stringify(items),
  });
}

/// Bulk import from a CSV file. The request is multipart/form-data with
/// a single `file` field; do NOT set Content-Type — the browser fills it
/// in with the correct multipart boundary automatically.
// --- Team ---

export type UserRole = "owner" | "admin" | "member";

export interface TeamMember {
  id: string;
  brand_id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface TeamInvite {
  id: string;
  brand_id: string;
  email: string;
  role: UserRole;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface TeamResponse {
  members: TeamMember[];
  invites: TeamInvite[];
}

export interface CreateInviteResponse {
  id: string;
  brand_id: string;
  email: string;
  role: UserRole;
  expires_at: string;
  created_at: string;
  /** Shown once. Use to build the accept-invite URL. */
  token: string;
}

export async function getTeam(cookieHeader?: string): Promise<TeamResponse> {
  return request<TeamResponse>("/v1/team/", {}, cookieHeader);
}

export async function inviteMember(
  email: string,
  role: Exclude<UserRole, "owner">,
): Promise<CreateInviteResponse> {
  return request<CreateInviteResponse>("/v1/team/invite", {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export async function revokeInvite(id: string): Promise<void> {
  await request<void>(`/v1/team/invite/${id}`, { method: "DELETE" });
}

export async function removeMember(userId: string): Promise<void> {
  await request<void>(`/v1/team/${userId}`, { method: "DELETE" });
}

export async function changeRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  await request<void>(`/v1/team/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function acceptInvite(
  token: string,
  password: string,
): Promise<void> {
  await request<void>(`/auth/accept-invite/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// --- Settings ---

export async function setCustomDomain(
  custom_domain: string | null,
): Promise<Brand> {
  return request<Brand>("/v1/settings/domain", {
    method: "PUT",
    body: JSON.stringify({ custom_domain }),
  });
}

export async function bulkImportCsv(file: File): Promise<BulkProductResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/v1/products/bulk/csv", {
    method: "POST",
    credentials: "include",
    body: form,
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // body wasn't JSON
    }
    throw new ApiError(res.status, message || res.statusText);
  }
  return (await res.json()) as BulkProductResponse;
}

// BACKEND-NEEDED: GET /v1/products/:id/events
export async function listProductEvents(
  productId: string,
  cookieHeader?: string,
): Promise<ProvenanceEvent[]> {
  return request<ProvenanceEvent[]>(
    `/v1/products/${productId}/events`,
    {},
    cookieHeader,
  );
}

export interface RecordEventRequest {
  event_type: EventType;
  detail?: unknown | null;
}

export async function recordEvent(
  productId: string,
  body: RecordEventRequest,
): Promise<ProvenanceEvent> {
  return request<ProvenanceEvent>(`/v1/products/${productId}/events`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type AnchorStatusFilter = "anchored" | "unanchored";

export interface EventListParams {
  product_id?: string;
  event_type?: EventType;
  anchor_status?: AnchorStatusFilter;
  limit?: number;
  offset?: number;
}

export async function listEvents(
  params: EventListParams = {},
  cookieHeader?: string,
): Promise<ProvenanceEvent[]> {
  const search = new URLSearchParams();
  if (params.product_id) search.set("product_id", params.product_id);
  if (params.event_type) search.set("event_type", params.event_type);
  if (params.anchor_status) search.set("anchor_status", params.anchor_status);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString() ? `?${search.toString()}` : "";
  return request<ProvenanceEvent[]>(`/v1/events${qs}`, {}, cookieHeader);
}

/// URL for a product's QR-code PNG. The browser fetches this directly via
/// the same-origin Next.js proxy so the session cookie is included
/// automatically — no fetch/blob plumbing needed.
export function productQrUrl(productId: string): string {
  return `/api/v1/products/${productId}/qr`;
}

// --- API keys ---

// BACKEND-NEEDED: GET /v1/keys
export async function listApiKeys(
  cookieHeader?: string,
): Promise<ApiKey[]> {
  return request<ApiKey[]>("/v1/keys", {}, cookieHeader);
}

export async function createApiKey(
  label: string | null,
): Promise<CreateApiKeyResponse> {
  return request<CreateApiKeyResponse>("/v1/keys", {
    method: "POST",
    body: JSON.stringify({ label }),
  });
}

export async function revokeApiKey(id: string): Promise<void> {
  await request<void>(`/v1/keys/${id}`, { method: "DELETE" });
}

// --- Anchors ---

export async function listAnchors(
  params: { limit?: number; offset?: number } = {},
  cookieHeader?: string,
): Promise<BrandAnchorView[]> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString() ? `?${search.toString()}` : "";
  return request<BrandAnchorView[]>(`/v1/anchors${qs}`, {}, cookieHeader);
}

// --- Public verify ---

export async function getVerify(productId: string): Promise<VerifyResponse> {
  return request<VerifyResponse>(`/verify/${productId}`);
}

// --- Billing ---

export type Plan = "atelier" | "maison" | "couture";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing";

export interface BillingResponse {
  plan: Plan;
  status: SubscriptionStatus;
  product_count: number;
  /** null means unlimited (Couture). */
  product_limit: number | null;
  current_period_end: string | null;
  stripe_configured: boolean;
}

export async function getBilling(
  cookieHeader?: string,
): Promise<BillingResponse> {
  return request<BillingResponse>("/v1/billing", {}, cookieHeader);
}

export interface CreateCheckoutResponse {
  url: string;
  /** false when Stripe is not configured and the URL is a placeholder. */
  stripe: boolean;
}

export async function createCheckoutSession(
  plan: Exclude<Plan, "atelier">,
): Promise<CreateCheckoutResponse> {
  return request<CreateCheckoutResponse>("/v1/billing/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}

// --- Webhooks ---

export type WebhookEventType =
  | "product.registered"
  | "event.recorded"
  | "anchor.confirmed";

export const WEBHOOK_EVENT_TYPES: WebhookEventType[] = [
  "product.registered",
  "event.recorded",
  "anchor.confirmed",
];

export interface WebhookEndpoint {
  id: string;
  brand_id: string;
  url: string;
  events: WebhookEventType[];
  active: boolean;
  created_at: string;
  // `secret` is intentionally omitted; the backend strips it from
  // serialization on every endpoint except the create response.
}

export interface CreateWebhookResponse {
  id: string;
  brand_id: string;
  url: string;
  events: WebhookEventType[];
  active: boolean;
  created_at: string;
  /** Returned exactly once at creation time. */
  secret: string;
}

export type WebhookDeliveryStatus = "pending" | "delivered" | "failed";

export interface WebhookDelivery {
  id: string;
  webhook_endpoint_id: string;
  event_type: WebhookEventType;
  payload: unknown;
  status: WebhookDeliveryStatus;
  attempts: number;
  last_attempted_at: string | null;
  created_at: string;
}

export async function listWebhookEndpoints(
  cookieHeader?: string,
): Promise<WebhookEndpoint[]> {
  return request<WebhookEndpoint[]>("/v1/webhooks", {}, cookieHeader);
}

export async function createWebhookEndpoint(
  url: string,
  events: WebhookEventType[],
): Promise<CreateWebhookResponse> {
  return request<CreateWebhookResponse>("/v1/webhooks", {
    method: "POST",
    body: JSON.stringify({ url, events }),
  });
}

export async function deactivateWebhookEndpoint(id: string): Promise<void> {
  await request<void>(`/v1/webhooks/${id}`, { method: "DELETE" });
}

export async function listWebhookDeliveries(
  endpointId: string,
  cookieHeader?: string,
): Promise<WebhookDelivery[]> {
  return request<WebhookDelivery[]>(
    `/v1/webhooks/${endpointId}/deliveries`,
    {},
    cookieHeader,
  );
}

export interface TransferRequest {
  new_owner_email: string;
  note?: string | null;
}

/// Public, unauthenticated. Records a `transferred` event on a product
/// that already has a `sold` event in its history.
export async function transferOwnership(
  productId: string,
  body: TransferRequest,
): Promise<ProvenanceEvent> {
  return request<ProvenanceEvent>(`/verify/${productId}/transfer`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
