#![deny(warnings)]

//! Argon2id password hashing and verification.
//!
//! Plain-text passwords never leave this module. Hashes are stored as the
//! standard PHC string so the algorithm parameters travel with the hash
//! and can be upgraded later without a schema change.

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use common::AppError;

/// Hash `password` with argon2id using default RustCrypto parameters and a
/// freshly-generated salt.
pub fn hash(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let phc = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AppError::Internal(format!("argon2 hash failed: {e}")))?;
    Ok(phc.to_string())
}

/// Verify `password` against a stored PHC `hash`. Returns `Ok(true)` on a
/// match, `Ok(false)` on a clean mismatch, and `Err` only if the stored
/// hash cannot be parsed (i.e., DB corruption).
pub fn verify(password: &str, hash: &str) -> Result<bool, AppError> {
    let parsed = PasswordHash::new(hash)
        .map_err(|e| AppError::Internal(format!("invalid stored password hash: {e}")))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}
