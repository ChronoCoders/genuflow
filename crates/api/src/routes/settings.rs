#![deny(warnings)]

//! `/v1/settings/*` — brand-level configuration that lives outside the
//! product/event/anchor model. Currently: custom verification domain.

use axum::{
    extract::{Extension, State},
    Json,
};
use common::{AppError, Brand};
use serde::Deserialize;
use uuid::Uuid;

use crate::middleware::rbac::OwnerOnly;
use crate::state::AppState;

const DOMAIN_MAX_LEN: usize = 253;
const LABEL_MAX_LEN: usize = 63;

/// Domains that may never be used as custom verification hosts.
///
/// - `genuflow.com` — our own apex. Squatting would let a tenant claim
///   a Genuflow-branded URL, including the advertised CNAME target the
///   dashboard tells customers to point at.
/// - `local`, `internal`, `localhost` — IANA / convention reserved
///   namespaces. Allowing them would route public verification links
///   into intranet or loopback space.
///
/// Each entry blocks the exact name *and* every subdomain of it.
const RESERVED_DOMAINS: &[&str] = &["genuflow.com", "local", "internal", "localhost"];

/// Hostnames that may never be used (exact match, no subdomain logic).
/// `localhost` also lives in `RESERVED_DOMAINS` so the subdomain form
/// `foo.localhost` is rejected; the exact entry here is defensive in
/// case the dot rule above is ever relaxed.
const RESERVED_EXACT: &[&str] = &["localhost"];

const RESERVED_DOMAIN_ERROR: &str =
    "this domain is reserved and cannot be used as a custom verification domain";

#[derive(Deserialize)]
pub struct DomainRequest {
    /// New custom domain, or `null` / omitted to clear.
    #[serde(default)]
    pub custom_domain: Option<String>,
}

/// `PUT /v1/settings/domain` — owner only. Set or clear the brand's
/// custom verification domain.
///
/// Validation accepts a bare hostname only: no protocol, no port, no
/// path. RFC 1035 label rules: 1–63 chars per label, total length
/// ≤ 253, alphanumeric or hyphen, no leading/trailing hyphen, at least
/// one dot. We deliberately do not perform a DNS resolution check
/// here — the brand may be configuring DNS in parallel; Cloudflare
/// fronts the actual routing in production.
pub async fn set_domain(
    _: OwnerOnly,
    State(state): State<AppState>,
    Extension(brand_id): Extension<Uuid>,
    Json(body): Json<DomainRequest>,
) -> Result<Json<Brand>, AppError> {
    let normalised = body.custom_domain.as_deref().and_then(|s| {
        let s = s.trim().trim_end_matches('.').to_ascii_lowercase();
        if s.is_empty() {
            None
        } else {
            Some(s)
        }
    });

    if let Some(host) = normalised.as_deref() {
        validate_hostname(host)?;
    }

    let brand = db::brands::set_custom_domain(&state.db, brand_id, normalised.as_deref())
        .await
        .map_err(|e| {
            if e.as_database_error()
                .and_then(|d| d.code())
                .is_some_and(|c| c == "23505")
            {
                AppError::Conflict(
                    "this domain is already in use by another brand".into(),
                )
            } else {
                AppError::Database(e)
            }
        })?
        .ok_or(AppError::NotFound)?;

    Ok(Json(brand))
}

/// RFC 1035-shaped hostname check. Returns 400 with a precise reason
/// on the first failing condition so the dashboard can show the user
/// what's wrong.
fn validate_hostname(host: &str) -> Result<(), AppError> {
    if host.len() > DOMAIN_MAX_LEN {
        return Err(AppError::BadRequest(format!(
            "domain must be at most {DOMAIN_MAX_LEN} characters"
        )));
    }
    if host.starts_with("http://") || host.starts_with("https://") {
        return Err(AppError::BadRequest(
            "domain must be a hostname only — no protocol".into(),
        ));
    }
    if host.contains('/') {
        return Err(AppError::BadRequest(
            "domain must be a hostname only — no path".into(),
        ));
    }
    if host.contains(':') {
        return Err(AppError::BadRequest(
            "domain must be a hostname only — no port".into(),
        ));
    }
    if !host.contains('.') {
        return Err(AppError::BadRequest(
            "domain must contain at least one dot (e.g. verify.yourbrand.com)".into(),
        ));
    }

    if is_reserved(host) {
        return Err(AppError::BadRequest(RESERVED_DOMAIN_ERROR.into()));
    }

    for label in host.split('.') {
        if label.is_empty() {
            return Err(AppError::BadRequest(
                "domain must not contain empty labels (consecutive dots)".into(),
            ));
        }
        if label.len() > LABEL_MAX_LEN {
            return Err(AppError::BadRequest(format!(
                "each domain label must be at most {LABEL_MAX_LEN} characters"
            )));
        }
        if label.starts_with('-') || label.ends_with('-') {
            return Err(AppError::BadRequest(
                "domain labels must not start or end with a hyphen".into(),
            ));
        }
        if !label
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-')
        {
            return Err(AppError::BadRequest(
                "domain labels may only contain letters, digits, and hyphens".into(),
            ));
        }
    }

    Ok(())
}

/// Check whether `host` falls under any reserved namespace. Returns
/// true for exact matches against `RESERVED_EXACT`, exact or subdomain
/// matches against `RESERVED_DOMAINS`, or any host whose entire
/// content parses as an IPv4 literal (rejected to keep verification
/// links from pointing at raw IPs).
fn is_reserved(host: &str) -> bool {
    if RESERVED_EXACT.contains(&host) {
        return true;
    }
    if host.parse::<std::net::Ipv4Addr>().is_ok() {
        return true;
    }
    for &reserved in RESERVED_DOMAINS {
        if host == reserved || host.ends_with(&format!(".{reserved}")) {
            return true;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    fn err(host: &str) -> String {
        match validate_hostname(host) {
            Ok(()) => panic!("expected {host} to be rejected"),
            Err(AppError::BadRequest(msg)) => msg,
            Err(other) => panic!("unexpected error variant for {host}: {other:?}"),
        }
    }

    #[test]
    fn accepts_well_formed_hostname() {
        validate_hostname("verify.luxuryhouse.com").unwrap();
        validate_hostname("a.b.c.example.io").unwrap();
    }

    #[test]
    fn rejects_genuflow_apex() {
        assert_eq!(err("genuflow.com"), RESERVED_DOMAIN_ERROR);
    }

    #[test]
    fn rejects_genuflow_subdomain() {
        assert_eq!(err("verify.genuflow.com"), RESERVED_DOMAIN_ERROR);
        assert_eq!(err("api.genuflow.com"), RESERVED_DOMAIN_ERROR);
    }

    #[test]
    fn rejects_local_and_internal_namespaces() {
        assert_eq!(err("verify.local"), RESERVED_DOMAIN_ERROR);
        assert_eq!(err("foo.internal"), RESERVED_DOMAIN_ERROR);
    }

    #[test]
    fn rejects_raw_ipv4_addresses() {
        // Loopback and a private-range example. Both have label shape
        // that would otherwise pass.
        assert_eq!(err("127.0.0.1"), RESERVED_DOMAIN_ERROR);
        assert_eq!(err("10.0.0.1"), RESERVED_DOMAIN_ERROR);
    }

    #[test]
    fn rejects_localhost_exact() {
        // localhost has no dot so it's rejected by the "must contain a
        // dot" rule before the reserved check runs — we assert here
        // mostly to document the path.
        assert!(validate_hostname("localhost").is_err());
    }

    #[test]
    fn lookalike_names_outside_reserved_namespace_pass() {
        // A name that *contains* a reserved label but isn't a
        // subdomain of one must still pass — e.g. `genuflow.com.uk`
        // (a fictional but legal hostname) or `mylocal.com`.
        validate_hostname("mylocal.com").unwrap();
        validate_hostname("internal-prefix.com").unwrap();
    }
}
