import Link from "next/link";
import { getAppSession } from "../src/server/auth/session";
import { GoogleSignInButton } from "../src/ui/auth/google-sign-in-button";
import { SignOutButton } from "../src/ui/auth/sign-out-button";

export const dynamic = "force-dynamic";

const connectedSystems = ["Auth.js", "Google OAuth", "PostgreSQL", "Stripe", "pg-boss"];

export default async function HomePage() {
  const session = await getAppSession();

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Phase 5 Authentication</p>
        <h1>Members sign in before billing and content flows begin.</h1>
        <p className="lede">
          Google sign-in is now the first real product boundary. We create or
          reuse a stable local user record, persist the auth session, and keep
          member-only pages on the server side of the gate.
        </p>
        <div className="buttonRow">
          {session.status === "authenticated" ? (
            <>
              <Link className="button buttonPrimary" href="/dashboard">
                Open dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <GoogleSignInButton callbackUrl="/dashboard" />
              <Link className="button buttonGhost" href="/signin">
                View sign-in page
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Current auth state</h2>
          {session.status === "authenticated" ? (
            <div className="stack">
              <p className="mutedText">
                Signed in as <strong>{session.user.name ?? session.user.email}</strong>
              </p>
              <dl className="detailList">
                <div>
                  <dt>Local user id</dt>
                  <dd>{session.user.id}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{session.user.email ?? "No email returned"}</dd>
                </div>
                <div>
                  <dt>Session expires</dt>
                  <dd>{session.expiresAt.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="mutedText">
              No authenticated session is active yet. Protected routes redirect
              to sign-in until a local user session exists.
            </p>
          )}
        </section>

        <section className="panel">
          <h2>Connected systems</h2>
          <ul className="moduleList">
            {connectedSystems.map((system) => (
              <li key={system}>{system}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
