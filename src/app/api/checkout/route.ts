import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentProfile } from "@/lib/auth";
import { appUrl, isStripeCheckoutConfigured, isSupabaseConfigured, stripeConfig } from "@/lib/config";
import { getCourseById } from "@/lib/data";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { courseId?: string } | null;
  const courseId = body?.courseId;

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required." }, { status: 400 });
  }

  const [course, profile] = await Promise.all([
    getCourseById(courseId),
    getCurrentProfile()
  ]);

  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  if (isSupabaseConfigured && !profile) {
    return NextResponse.json({ error: "Please log in before checkout." }, { status: 401 });
  }

  const origin = request.headers.get("origin") ?? appUrl;

  if (!isStripeCheckoutConfigured || !stripeConfig.secretKey) {
    return NextResponse.json({
      url: `${origin}/checkout/success?demo=1&course=${course.slug}`
    });
  }

  const stripe = new Stripe(stripeConfig.secretKey);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel?course=${course.slug}`,
    customer_email: profile?.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: course.price_cents,
          product_data: {
            name: course.title,
            description: course.description.slice(0, 500),
            images: [course.thumbnail_url]
          }
        }
      }
    ],
    metadata: {
      course_id: course.id,
      course_slug: course.slug,
      user_id: profile?.id ?? "demo-user"
    }
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: session.url });
}
