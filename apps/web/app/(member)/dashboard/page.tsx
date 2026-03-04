import Link from "next/link";
import { requireAuthenticatedAppSession } from "../../../src/server/auth/session";
import {
  formatPlanTierLabel,
  loadMemberDashboardArticles
} from "../../../src/server/content/content-reader";
import { SignOutButton } from "../../../src/ui/auth/sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuthenticatedAppSession({
    returnTo: "/dashboard"
  });
  const result = await loadMemberDashboardArticles({
    viewerUserId: session.user.id
  });
  const unlockedCount = result.items.filter((item) => !item.isLocked).length;

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Member library</p>
        <h1>Welcome back, {session.user.name ?? "member"}.</h1>
        <p className="lede">
          Your article list is resolved on the server from the local access
          state we already track. Locked stories stay visible so the reading
          path makes sense even before checkout flows arrive.
        </p>
        <div className="buttonRow">
          <Link className="button buttonPrimary" href="/account">
            View account
          </Link>
          <SignOutButton />
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Published articles</h2>
            <p className="mutedText">
              {unlockedCount} unlocked of {result.items.length} available in
              your current local member state.
            </p>
          </div>
          <p className="metaText">Local user id: {session.user.id}</p>
        </div>

        {result.items.length === 0 ? (
          <div className="panelCentered" style={{ padding: "3rem 0" }}>
            <p className="mutedText">No articles are currently published. Check back later.</p>
          </div>
        ) : (
          <div className="articleGrid">
            {result.items.map((item) => (
              <article className="articleCard" key={item.id}>
                <div className="articleCardHeader">
                  <span
                    className={`pill ${item.isLocked ? "pillLocked" : "pillUnlocked"}`}
                  >
                    {item.isLocked
                      ? `Locked · ${formatPlanTierLabel(item.requiredTier)}`
                      : "Unlocked"}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p className="mutedText">{item.excerpt}</p>
                <p className="metaText">
                  Requires {formatPlanTierLabel(item.requiredTier)}
                </p>
                <Link
                  className={`button ${item.isLocked ? "buttonGhost" : "buttonPrimary"}`}
                  href={`/articles/${item.slug}`}
                >
                  {item.isLocked ? "View lock details" : "Read article"}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
