"use client";

import { startTransition, useState } from "react";
import { clientAuthActions } from "./client-auth-actions";

export interface SignOutButtonProps {
  callbackUrl?: string;
}

export function SignOutButton({
  callbackUrl = "/"
}: SignOutButtonProps) {
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      className="button buttonGhost"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          setIsPending(true);
          void clientAuthActions.startSignOut({
            callbackUrl
          });
        });
      }}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
