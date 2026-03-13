# ADR-006: JWT Authentication with localStorage

**Status**: Accepted  
**Date**: 2025-01-01  
**Scope**: Backend, Frontend

## Context

The application needs to authenticate users and maintain session state across requests. The backend is a stateless REST API and the frontend is a SPA -- the authentication mechanism must work across this separation.

## Decision

Use **JSON Web Tokens (JWT)** for authentication, stored in the browser's **localStorage**.

### Implementation

- **Backend**: `jsonwebtoken` library for token creation and verification; `bcrypt` for password hashing
- **Token payload**: `{ userId, email, role }` with issuer (`fitness-tracker-app`) and audience (`fitness-tracker-users`) claims
- **Access token expiry**: 7 days
- **Refresh token expiry**: 30 days
- **Frontend storage**: Token and user data persisted to `localStorage` via Zustand auth store
- **Request attachment**: Axios request interceptor reads token from `localStorage` and adds `Authorization: Bearer <token>` header
- **Auto-logout**: Axios response interceptor detects 401 responses (except on auth routes) and triggers `authStore.logout()`

## Consequences

### Positive

- **Stateless backend**: No server-side session storage needed; each request is self-contained
- **Simple implementation**: Standard pattern with well-supported libraries
- **SPA-friendly**: Token persists across page refreshes via `localStorage`
- **Role-based access**: Role is embedded in the token payload, enabling authorization middleware without additional DB queries

### Negative

- **XSS vulnerability**: `localStorage` is accessible to any JavaScript on the page. An XSS attack could steal the token. HttpOnly cookies would mitigate this but add CSRF complexity
- **No server-side revocation**: Tokens cannot be individually revoked before expiry without a token blacklist or database check (not implemented)
- **Long-lived tokens**: 7-day access tokens are generous; a shorter lifetime with refresh token rotation would be more secure
- **Token size**: JWT payload is sent with every request, increasing header size compared to an opaque session ID

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|-------------|
| HttpOnly cookies | More secure against XSS but introduces CSRF protection requirements and complicates CORS for a SPA + API setup |
| Session-based auth (server-side) | Requires session store (Redis, DB); adds statefulness to the backend |
| OAuth2 / OpenID Connect | Overkill for a first-party app with email/password auth |
| Paseto tokens | Less ecosystem support than JWT; no significant benefit for this use case |

## References

- JWT utilities: `backend/src/utils/jwt.utils.ts`
- Auth middleware: `backend/src/middlewares/auth.middleware.ts`
- Authorize middleware: `backend/src/middlewares/authorize.middleware.ts`
- Zustand auth store: `frontend/src/store/authStore.ts`
- Axios interceptors: `frontend/src/api/client.ts`
- Auth flow diagram: `docs/architecture/04-data-flow.md` (section 1)
