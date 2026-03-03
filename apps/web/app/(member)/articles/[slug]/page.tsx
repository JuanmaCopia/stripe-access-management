import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthenticatedAppSession } from "../../../../src/server/auth/session";
import {
  describeLockedArticleReason,
  formatPlanTierLabel,
  loadMemberArticle
} from "../../../../src/server/content/content-reader";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const session = await requireAuthenticatedAppSession({
    returnTo: `/articles/${slug}`
  });
  const result = await loadMemberArticle({
    slug,
    viewerUserId: session.user.id
  });

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status === "locked") {
    return (
      <main className="shell shellCompact">
        <section className="hero">
          <p className="eyebrow">Locked article</p>
          <h1 className="titleMedium">{result.article.title}</h1>
          <p className="lede">{result.article.excerpt}</p>
          <div className="buttonRow">
            <Link className="button buttonPrimary" href="/dashboard">
              Back to dashboard
            </Link>
            <Link className="button buttonGhost" href="/">
              View pricing shell
            </Link>
          </div>
        </section>

        <section className="panel">
          <div className="articleMetaRow">
            <span className="pill pillLocked">
              Requires {formatPlanTierLabel(result.article.requiredTier)}
            </span>
            <span className="metaText">
              Access status: {result.article.access.reason.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mutedText">
            {describeLockedArticleReason(result.article.access.reason)}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell shellCompact">
      <section className="hero">
        <p className="eyebrow">Unlocked article</p>
        <h1 className="titleMedium">{result.article.title}</h1>
        <p className="lede">{result.article.excerpt}</p>
        <div className="buttonRow">
          <Link className="button buttonPrimary" href="/dashboard">
            Back to dashboard
          </Link>
          <Link className="button buttonGhost" href="/account">
            Account
          </Link>
        </div>
      </section>

      <article className="panel articleBody">
        {renderArticleBody(result.article.bodyMarkdown)}
      </article>
    </main>
  );
}

function renderArticleBody(bodyMarkdown: string) {
  return bodyMarkdown
    .split(/\n\s*\n/u)
    .filter((block) => block.trim().length > 0)
    .map((block, index) => {
      if (block.startsWith("# ")) {
        return <h2 key={`${index}:${block}`}>{block.slice(2)}</h2>;
      }

      return <p key={`${index}:${block}`}>{block}</p>;
    });
}
