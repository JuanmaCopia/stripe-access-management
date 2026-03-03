"use client";

import { startTransition, useState } from "react";
import { clientAuthActions } from "./client-auth-actions";

export interface GoogleSignInButtonProps {
  callbackUrl?: string;
}

export function GoogleSignInButton({
  callbackUrl = "/dashboard"
}: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      className="button buttonPrimary"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          setIsPending(true);
          void clientAuthActions.startGoogleSignIn({
            callbackUrl
          });
        });
      }}
      type="button"
    >
      {isPending ? "Redirecting to Google..." : "Continue with Google"}
    </button>
  );
}
