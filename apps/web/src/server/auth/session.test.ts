import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSignInPath,
  normalizeAppSession,
  resolveProtectedAppSession
} from "./session";

test("normalizeAppSession returns unauthenticated when no local user id is present", () => {
  const result = normalizeAppSession(null);

  assert.deepEqual(result, {
    status: "unauthenticated"
  });
});

test("normalizeAppSession returns authenticated local-user context", () => {
  const result = normalizeAppSession({
    expires: "2026-04-01T00:00:00.000Z",
    user: {
      email: "member@example.com",
      id: "user_123",
      image: "https://example.com/member.png",
      name: "Member"
    }
  });

  assert.equal(result.status, "authenticated");
  assert.equal(result.user.id, "user_123");
  assert.equal(result.user.email, "member@example.com");
  assert.equal(result.expiresAt.toISOString(), "2026-04-01T00:00:00.000Z");
});

test("buildSignInPath preserves the original destination when present", () => {
  assert.equal(buildSignInPath(), "/signin");
  assert.equal(
    buildSignInPath("/account"),
    "/signin?callbackUrl=%2Faccount"
  );
});

test("resolveProtectedAppSession redirects unauthenticated access and preserves authenticated access", () => {
  const authenticated = resolveProtectedAppSession(
    {
      expiresAt: new Date("2026-04-01T00:00:00.000Z"),
      status: "authenticated",
      user: {
        email: "member@example.com",
        id: "user_123",
        imageUrl: "https://example.com/member.png",
        name: "Member"
      }
    },
    "/dashboard"
  );
  const unauthenticated = resolveProtectedAppSession(
    {
      status: "unauthenticated"
    },
    "/dashboard"
  );

  assert.equal(authenticated.status, "authenticated");
  assert.equal(authenticated.session.user.id, "user_123");
  assert.deepEqual(unauthenticated, {
    redirectTo: "/signin?callbackUrl=%2Fdashboard",
    status: "unauthenticated"
  });
});
