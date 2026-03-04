import { NextResponse } from "next/server";
import { getAppSession } from "../../../src/server/auth/session";
import { createInfrastructureCompositionFromEnv } from "@stripe-access-management/infrastructure";

export async function POST(request: Request) {
  const session = await getAppSession();

  if (session.status !== "authenticated") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return new NextResponse("Invalid form data", { status: 400 });
  }

  const planTier = formData.get("planTier");
  const billingInterval = formData.get("billingInterval");

  if (typeof planTier !== "string" || typeof billingInterval !== "string") {
    return new NextResponse("Missing planTier or billingInterval", { status: 400 });
  }

  const composition = createInfrastructureCompositionFromEnv({});
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await composition.useCases.startCheckout.execute({
    cancelUrl: `${origin}/`,
    selectedPlan: {
      billingInterval: billingInterval as "MONTHLY" | "YEARLY",
      tier: planTier as "STARTER" | "PRO" | "ULTRA"
    },
    successUrl: `${origin}/dashboard?checkout=success`,
    userId: session.user.id
  });

  if (result.status === "duplicate_subscription") {
    const portalResult = await composition.useCases.openBillingPortal.execute({
      returnUrl: `${origin}/account`,
      userId: session.user.id
    });

    if (portalResult.status === "ready") {
      return NextResponse.redirect(portalResult.billingPortalUrl, 303);
    }

    return new NextResponse("Billing portal unavailable", { status: 400 });
  }

  if (result.status === "ready") {
    return NextResponse.redirect(result.checkoutSessionUrl, 303);
  }

  return new NextResponse(result.status, { status: 400 });
}
