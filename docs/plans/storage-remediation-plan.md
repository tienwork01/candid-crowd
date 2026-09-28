# Storage Remediation Plan

Last updated: 2026-09-28

This plan tracks the frontend-storage findings in `docs/fe-storage-audit.md` and the cross-repository work in `candid-crowd-fe` and `candid-crowd-be`.

## Completed

### QR configuration persistence

- [x] Added `events.qr_config` through backend migration `000025`.
- [x] Extended the authenticated event update contract with `qr_config`.
- [x] Added JSON and color validation, with a 400 KB payload ceiling.
- [x] Updated the frontend event types, list mapping, update mutation, QR modal, ready card, and print modal.
- [x] Retained `localStorage` as a cache only; the API response is now the canonical configuration.

### Guest media metadata

- [x] Added `media.guest_name` and `media.caption` through backend migration `000025`.
- [x] Accepted, normalized, and persisted metadata during upload-target reservation.
- [x] Included metadata in public/host gallery projections and realtime media items.
- [x] Persisted metadata in the IndexedDB pending-upload record and replayed it on retry.

### Guest upload recovery

- [x] Confirmed the guest event page already restores and retries persisted uploads when online.
- [x] Updated `/offline` to navigate to the event owning the first pending upload after connectivity returns, allowing that recovery flow to run.

## Verified

- [x] Backend: `make test`, `make vet`, and `make build`.
- [x] Frontend: `pnpm typecheck`, `pnpm lint`, `pnpm validate:locales`, `pnpm audit:unused-keys`, and `pnpm build`.
- [ ] Backend `make lint`: currently blocked by a `golangci-lint` / Go export-data incompatibility affecting pre-existing files. `go test` and `go build` pass.

## In progress — do not deploy yet

### Host event-create idempotency

- [x] Added draft migration `000026_event_create_idempotency` with `events.client_request_id` and a partial unique index on `(host_id, client_request_id)`.
- [x] Added draft request/model fields for `client_request_id`.
- [ ] Complete service/repository idempotency: look up an existing event by host and request ID before insert, and re-read it after a concurrent unique-key conflict.
- [ ] Add unit and handler tests for a repeated create request returning the same event.
- [ ] Reformat and validate the currently draft handler code before deployment.

The current `000026` work is incomplete and must not be migrated or released until all checklist items in this section are complete.

## Next implementation sequence

1. Finish and test backend event-create idempotency.
2. Create an IndexedDB host outbox with explicit operation status: `queued`, `syncing`, `failed`, and `complete`.
3. Queue offline event creation with a generated `client_request_id`; on sync, replace the local `evt_*` event with the server event and redirect stale local routes safely.
4. Queue host event PATCH operations after event creation is acknowledged; coalesce updates per event while preserving ordering.
5. Decide the offline policy for media moderation. Prefer an explicit pending state over silently treating delete/status changes as server-confirmed.
6. Add a visible host sync indicator and a retry action for failed operations.
7. Add browser tests for offline create, reload, reconnect, response loss, and repeated replay.

## Deferred architecture

QR logo data currently remains inside the bounded `qr_config` payload for continuity across devices. A later asset-domain change should upload logos to private R2 storage and retain only an asset reference in `qr_config`; it must not reuse the anonymous guest-media upload endpoint.
