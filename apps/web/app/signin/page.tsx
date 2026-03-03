import { redirect } from "next/navigation";
import { getAppSession } from "../../src/server/auth/session";
import { GoogleSignInButton } from "../../src/ui/auth/google-sign-in-button";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignInPage({
  searchParams
}: SignInPageProps) {
  const session = await getAppSession();

  if (session.status === "authenticated") {
    redirect("/dashboard");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string" &&
    resolvedSearchParams.callbackUrl.length > 0
      ? resolvedSearchParams.callbackUrl
      : "/dashboard";

  return (
    <main className="shell shellCompact">
      <section className="panel panelCentered">
        <p className="eyebrow">Sign in</p>
        <h1 className="titleMedium">Continue with your Google account</h1>
        <p className="lede">
          The web app links Google login to a stable local user before protected
          member routes can load.
        </p>
        <div className="buttonRow">
          <GoogleSignInButton callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  );
}
