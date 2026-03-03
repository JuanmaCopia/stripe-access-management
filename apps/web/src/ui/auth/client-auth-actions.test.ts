import assert from "node:assert/strict";
import test from "node:test";
import type { SignOutParams, SignOutResponse } from "next-auth/react";
import { createClientAuthActions } from "./client-auth-actions";

function createSignOutStub(
  captured: Array<unknown[]>
): <R extends boolean = true>(
  options?: SignOutParams<R>
) => Promise<R extends true ? undefined : SignOutResponse> {
  return (async <R extends boolean = true>(
    options?: SignOutParams<R>
  ) => {
    captured.push(options ? [options] : []);

    return undefined as R extends true ? undefined : SignOutResponse;
  }) as <R extends boolean = true>(
    options?: SignOutParams<R>
  ) => Promise<R extends true ? undefined : SignOutResponse>;
}

test("client auth actions invoke Google sign-in with the requested callback URL", async () => {
  const captured: Array<unknown[]> = [];
  const actions = createClientAuthActions({
    async signIn(...args) {
      captured.push(args);
      return undefined;
    },
    signOut: createSignOutStub([])
  });

  await actions.startGoogleSignIn({
    callbackUrl: "/dashboard"
  });

  assert.deepEqual(captured, [["google", { callbackUrl: "/dashboard" }]]);
});

test("client auth actions sign out to the home page by default", async () => {
  const captured: Array<unknown[]> = [];
  const actions = createClientAuthActions({
    async signIn() {
      return undefined;
    },
    signOut: createSignOutStub(captured)
  });

  await actions.startSignOut();

  assert.deepEqual(captured, [[{ callbackUrl: "/" }]]);
});
