import { NextResponse } from "next/server";
import { createInfrastructureCompositionFromEnv } from "@stripe-access-management/infrastructure";

export async function POST(request: Request) {
  const composition = createInfrastructureCompositionFromEnv({});
  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret) {
    composition.logger.error("Missing STRIPE_WEBHOOK_SECRET configuration.");
    return new NextResponse("Server configuration error", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  const body = await request.text();
  let event;

  try {
    event = composition.stripe.client.webhooks.constructEvent(
      body,
      signature,
      stripeSecret
    );
  } catch (error: any) {
    composition.logger.error("Stripe webhook signature verification failed", {
      error: error.message
    });
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const normalizedEvent = composition.stripe.eventNormalizer.normalize({
    event
  });

  if (normalizedEvent) {
    await composition.useCases.recordStripeWebhook.execute({
      event: normalizedEvent
    });
  } else {
    composition.logger.info("Ignored unsupported Stripe webhook event", {
      type: event.type
    });
  }

  return new NextResponse("ok", { status: 200 });
}
