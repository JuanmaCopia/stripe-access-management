"use client";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  type SignInOptions,
  type SignOutParams
} from "next-auth/react";

export interface ClientAuthExecutor {
  signIn: typeof nextAuthSignIn;
  signOut: typeof nextAuthSignOut;
}

export function createClientAuthActions(
  executor: ClientAuthExecutor = {
    signIn: nextAuthSignIn,
    signOut: nextAuthSignOut
  }
) {
  return {
    async startGoogleSignIn(
      options: Pick<SignInOptions, "callbackUrl"> = {}
    ) {
      await executor.signIn("google", {
        callbackUrl: options.callbackUrl
      });
    },
    async startSignOut(
      options: Pick<SignOutParams<true>, "callbackUrl"> = {}
    ) {
      await executor.signOut({
        callbackUrl: options.callbackUrl ?? "/"
      });
    }
  };
}

export const clientAuthActions = createClientAuthActions();
