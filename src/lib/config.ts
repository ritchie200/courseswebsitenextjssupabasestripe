const placeholderTokens = ["your_", "replace_", "example", "placeholder"];

function present(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  const lowered = value.toLowerCase();
  return !placeholderTokens.some((token) => lowered.includes(token));
}

export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};

export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
};

export const anthropicConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514"
};

export const isSupabaseConfigured =
  present(supabaseConfig.url) && present(supabaseConfig.anonKey);

export const isSupabaseAdminConfigured =
  isSupabaseConfigured && present(supabaseConfig.serviceRoleKey);

export const isStripeConfigured =
  present(stripeConfig.secretKey) && present(stripeConfig.webhookSecret);

export const isStripeCheckoutConfigured = present(stripeConfig.secretKey);

export const isAnthropicConfigured = present(anthropicConfig.apiKey);

export function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
