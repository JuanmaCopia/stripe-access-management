import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { createWebAuthOptionsFromEnv } from "./config";

export interface AppSessionUser {
  email: string | null;
  id: string;
  imageUrl: string | null;
  name: string | null;
}

export interface AuthenticatedAppSession {
  expiresAt: Date;
  status: "authenticated";
  user: AppSessionUser;
}

export interface UnauthenticatedAppSession {
  status: "unauthenticated";
}

export type AppSessionResult =
  | AuthenticatedAppSession
  | UnauthenticatedAppSession;

export type ProtectedAppSessionResolution =
  | {
      session: AuthenticatedAppSession;
      status: "authenticated";
    }
  | {
      redirectTo: string;
      status: "unauthenticated";
    };

export async function getAppSession(): Promise<AppSessionResult> {
  const session = await getServerSession(createWebAuthOptionsFromEnv());

  return normalizeAppSession(session);
}

export function normalizeAppSession(session: Session | null): AppSessionResult {
  if (!session?.user?.id) {
    return {
      status: "unauthenticated"
    };
  }

  return {
    expiresAt: new Date(session.expires),
    status: "authenticated",
    user: {
      email: session.user.email ?? null,
      id: session.user.id,
      imageUrl: session.user.image ?? null,
      name: session.user.name ?? null
    }
  };
}

export function buildSignInPath(returnTo?: string): string {
  if (!returnTo) {
    return "/signin";
  }

  return `/signin?callbackUrl=${encodeURIComponent(returnTo)}`;
}

export function resolveProtectedAppSession(
  session: AppSessionResult,
  returnTo?: string
): ProtectedAppSessionResolution {
  if (session.status === "authenticated") {
    return {
      session,
      status: "authenticated"
    };
  }

  return {
    redirectTo: buildSignInPath(returnTo),
    status: "unauthenticated"
  };
}

export async function requireAuthenticatedAppSession(options: {
  returnTo?: string;
} = {}): Promise<AuthenticatedAppSession> {
  const resolution = resolveProtectedAppSession(
    await getAppSession(),
    options.returnTo
  );

  if (resolution.status === "authenticated") {
    return resolution.session;
  }

  redirect(resolution.redirectTo);
}
