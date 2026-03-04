import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell shellCompact">
      <section className="panel">
        <p className="eyebrow">404</p>
        <h1 className="titleMedium">Page not found</h1>
        <p className="mutedText">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="buttonRow">
          <Link href="/" className="button buttonPrimary">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
