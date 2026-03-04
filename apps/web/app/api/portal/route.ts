import { NextResponse } from "next/server";
import { getAppSession } from "../../../src/server/auth/session";
import { createInfrastructureCompositionFromEnv } from "@stripe-access-management/infrastructure";

export async function POST(request: Request) {
  const session = await getAppSession();

  if (session.status !== "authenticated") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const composition = createInfrastructureCompositionFromEnv({});
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await composition.useCases.openBillingPortal.execute({
    returnUrl: `${origin}/account`,
    userId: session.user.id
  });

  if (result.status === "ready") {
    return NextResponse.redirect(result.billingPortalUrl, 303);
  }

  return new NextResponse(result.status, { status: 400 });
}
