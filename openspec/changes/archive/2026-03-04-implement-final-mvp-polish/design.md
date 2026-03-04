## Context

Phase 12 is the final visual and experiential pass over the MVP. The Next.js App Router provides built-in file conventions (`loading.tsx`, `error.tsx`, `not-found.tsx`, and `metadata` exports) that we will leverage to achieve this polish efficiently.

## Goals / Non-Goals

**Goals:**
- Implement `loading.tsx` for the main layout and member areas.
- Implement `error.tsx` to prevent blank screens on failure.
- Add `Metadata` exports to `app/layout.tsx` and `app/page.tsx`.
- Review and refine `globals.css` for mobile responsiveness.

**Non-Goals:**
- Complete UI redesigns or introducing complex component libraries (Tailwind, etc.). We will stick to the existing Vanilla CSS approach.
- Advanced analytics tracking or complex SEO strategies (schema.org JSON-LD).

## Decisions

### 1. Next.js Native Boundaries
We will use standard Next.js conventions (`loading.tsx`, `error.tsx`) rather than building custom React Contexts or state variables for these concerns. This keeps the components clean and relies on the framework's native streaming and error-handling capabilities.

### 2. Global CSS Adjustments
We will make targeted changes to `apps/web/app/globals.css` to ensure padding, margins, and flex directions degrade gracefully on smaller viewports.
