import Link from "next/link";
import { requireAuthenticatedAppSession } from "../../../src/server/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireAuthenticatedAppSession({
    returnTo: "/account"
  });

  return (
    <main className="shell shellCompact">
      <section className="panel">
        <p className="eyebrow">Account</p>
        <h1 className="titleMedium">Authenticated member details</h1>
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
            <dt>Name</dt>
            <dd>{session.user.name ?? "No display name returned"}</dd>
          </div>
        </dl>
        <div className="buttonRow">
          <Link className="button buttonPrimary" href="/dashboard">
            Back to dashboard
          </Link>
          <form action="/api/portal" method="POST">
            <button className="button buttonGhost" type="submit">
              Manage billing
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
