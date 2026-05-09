import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isStripeConfigured, stripeConfig } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured || !stripeConfig.secretKey || !stripeConfig.webhookSecret) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook is not configured. Use STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET from Stripe test mode."
      },
      { status: 501 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = new Stripe(stripeConfig.secretKey);
  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeConfig.webhookSecret
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const courseId = session.metadata?.course_id;
    const userId = session.metadata?.user_id;

    if (!courseId || !userId || session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role is required to write orders." },
        { status: 500 }
      );
    }

    // Test locally with:
    // stripe listen --forward-to localhost:3000/api/stripe/webhook
    // stripe trigger checkout.session.completed
    // In production, add the live webhook endpoint in Stripe and keep the live
    // signing secret in server-only environment configuration.
    const amountCents = session.amount_total ?? 0;
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: paymentIntent,
          amount_cents: amountCents,
          currency: session.currency ?? "usd",
          status: "paid"
        },
        {
          onConflict: "stripe_checkout_session_id"
        }
      )
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          source_order_id: order.id
        },
        {
          onConflict: "user_id,course_id"
        }
      );

    if (enrollmentError) {
      return NextResponse.json({ error: enrollmentError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
