"use client"; // Error components must be Client Components

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <main className="shell shellCompact">
      <section className="panel">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="titleMedium">An unexpected error occurred.</h1>
        <p className="mutedText">
          We're sorry for the inconvenience. Our team has been notified.
        </p>
        <div className="buttonRow">
          <button
            className="button buttonPrimary"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
