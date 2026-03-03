import Link from "next/link";
import { requireAuthenticatedAppSession } from "../../../src/server/auth/session";
import { SignOutButton } from "../../../src/ui/auth/sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuthenticatedAppSession({
    returnTo: "/dashboard"
  });

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Member dashboard</p>
        <h1>Welcome back, {session.user.name ?? "member"}.</h1>
        <p className="lede">
          This route is protected on the server. Later phases will layer content
          listings, checkout entry points, and billing management on top of this
          authenticated boundary.
        </p>
        <div className="buttonRow">
          <Link className="button buttonPrimary" href="/account">
            View account
          </Link>
          <SignOutButton />
        </div>
      </section>

      <section className="panel">
        <h2>Current local user context</h2>
        <dl className="detailList">
          <div>
            <dt>User id</dt>
            <dd>{session.user.id}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{session.user.email ?? "No email returned"}</dd>
          </div>
          <div>
            <dt>Display name</dt>
            <dd>{session.user.name ?? "No display name returned"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
