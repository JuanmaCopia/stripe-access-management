import Link from "next/link";
import { getAppSession } from "../src/server/auth/session";
import { GoogleSignInButton } from "../src/ui/auth/google-sign-in-button";
import { SignOutButton } from "../src/ui/auth/sign-out-button";

export const dynamic = "force-dynamic";

const pricingTiers = [
  {
    cta: "Starter access",
    description:
      "Read the starter blueprint and the practical member notes that build the baseline experience.",
    name: "Starter",
    price: "$9/mo"
  },
  {
    cta: "Pro depth",
    description:
      "Unlock deeper operational and growth pieces while keeping lower tiers included automatically.",
    name: "Pro",
    price: "$19/mo"
  },
  {
    cta: "Ultra archive",
    description:
      "Reach the highest-tier strategy writing and validate the full locked-versus-unlocked reading path.",
    name: "Ultra",
    price: "$39/mo"
  }
] as const;

export default async function HomePage() {
  const session = await getAppSession();

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Member reading MVP</p>
        <h1>Tiered articles, protected on the server, ready for real readers.</h1>
        <p className="lede">
          The public shell now explains the reading tiers, while the member
          dashboard and article routes stay behind the authenticated boundary.
          Locked and unlocked states come from the same local access rules that
          later billing and webhook phases will update.
        </p>
        <div className="buttonRow">
          {session.status === "authenticated" ? (
            <>
              <Link className="button buttonPrimary" href="/dashboard">
                Open member dashboard
              </Link>
              <Link className="button buttonGhost" href="/account">
                View account
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
          <h2>How access works</h2>
          <div className="stack">
            <p className="mutedText">
              Sign in establishes a stable local user, the dashboard projects
              article access from local subscription state, and article routes
              never ship the protected body when access is denied.
            </p>
            <p className="mutedText">
              This phase ships the reading experience first so the product can
              validate the content boundary before Stripe purchase flows are
              introduced.
            </p>
          </div>
        </section>

        <section className="panel">
          <h2>Current session</h2>
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
              No authenticated session is active yet. The public shell stays
              open, while member article routes redirect to sign-in until a
              local user session exists.
            </p>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Pricing shell</h2>
            <p className="mutedText">
              Checkout is still a later phase, but the tier story is now clear
              enough to support locked-content messaging.
            </p>
          </div>
          <p className="metaText">Monthly MVP framing</p>
        </div>
        <div className="pricingGrid">
          {pricingTiers.map((tier) => (
            <article className="pricingCard" key={tier.name}>
              <p className="eyebrow">{tier.name}</p>
              <p className="pricingPrice">{tier.price}</p>
              <p className="mutedText">{tier.description}</p>
              <p className="metaText">{tier.cta}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
