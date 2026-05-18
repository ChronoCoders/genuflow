# --- build stage -----------------------------------------------------------
FROM rust:1.90-bookworm AS builder

WORKDIR /build

# Copy the whole workspace and build the api binary in release mode.
# sqlx's `migrate!` macro embeds the SQL files into the binary at compile
# time, so the runtime image doesn't need the migrations/ directory.
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
COPY migrations ./migrations

RUN cargo build --release -p api

# --- runtime stage ---------------------------------------------------------
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/target/release/genuflow /usr/local/bin/genuflow

EXPOSE 8080

CMD ["genuflow"]
