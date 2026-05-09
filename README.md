# CourseForge

CourseForge is a public GitHub-ready course-selling app built with Next.js, Supabase, Stripe test checkout, and Claude API. It is meant to look like the kind of project I would show in a developer portfolio: real routes, server-side integration boundaries, database schema, RLS examples, and honest limitations.

## Why I Built It

I wanted a course platform that goes beyond a catalog page. The app covers the parts that usually make these projects interesting: paid access, protected lesson content, progress tracking, admin publishing, and an AI assistant that is constrained to the current lesson.

## Main Features

- Supabase Auth login and registration
- Public course catalog and course detail pages
- Stripe Checkout one-time course purchase flow in test mode
- Stripe webhook route that creates orders and enrollments after payment
- Student dashboard with enrolled courses, progress, and purchase history
- Lesson viewer with sidebar navigation, video URL placeholder, and completion tracking
- Claude-powered course assistant on lesson pages
- Mock assistant response when no Claude API key is configured
- Admin dashboard with course stats
- Admin course, module, and lesson create/edit/delete screens
- Published/draft course support
- Loading, empty, error, and toast states

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase Auth and Postgres
- Supabase Row Level Security
- Stripe Checkout and webhooks
- Claude API through `@anthropic-ai/sdk`
- Tailwind CSS
- Lucide icons

## User Roles

- `student`: can browse, buy courses, view enrolled lessons, track progress, and ask the course assistant questions.
- `admin`: can manage courses, modules, lessons, pricing, publishing, enrolled students, and course stats.

Admin access is checked on the server. The UI never trusts a role value sent from the browser.

## Database Structure

The Supabase migration is in:

```text
supabase/migrations/0001_initial_schema.sql
```

Tables:

- `profiles`
- `courses`
- `modules`
- `lessons`
- `enrollments`
- `lesson_progress`
- `orders`
- `ai_chat_history`

The migration includes RLS policy examples for public course reads, enrolled lesson access, student-owned progress, student-owned chat history, and admin-only content writes.

## How Supabase Is Used

Supabase handles authentication and database storage. Public browser code only uses:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

The service role key is only used in server-side code for trusted admin and webhook writes:

```env
SUPABASE_SERVICE_ROLE_KEY
```

Do not expose the service role key in frontend code.

## How Stripe Test Checkout Works

The route `POST /api/checkout` creates a Stripe Checkout Session in `payment` mode. Course price comes from the database/demo data, not from the client request.

The route `POST /api/stripe/webhook` verifies the Stripe signature, records a paid order, and creates the enrollment. The success page does not grant access by itself.

Local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

Use Stripe test mode only for this project.

## How The Claude Assistant Works

The assistant is available inside the lesson viewer. The browser sends the course slug, lesson id, and student question to `POST /api/ai/assistant`.

The server loads the current course and lesson content, then asks Claude to answer only from that material. If the answer is not present, the assistant should say the information is not covered in the current lesson.

If `ANTHROPIC_API_KEY` is missing, the route returns a mock response so the app still works in demo mode. The Claude API key is never exposed to frontend code.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Fill only local/test values in `.env.local`. Do not commit `.env.local`.

Environment placeholders:

```env
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_server_only

# STRIPE_SECRET_KEY=your_stripe_test_secret_key
# STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_test_publishable_key

# ANTHROPIC_API_KEY=your_claude_api_key
# ANTHROPIC_MODEL=claude-sonnet-4-20250514

# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Without environment variables, the app uses demo course data and mock integration responses.

## Screenshots

Add screenshots after running the app locally:

```text
public/screenshots/home.png
public/screenshots/course-detail.png
public/screenshots/lesson-assistant.png
public/screenshots/admin-dashboard.png
```

## Manual Testing Checklist

- Register a student with Supabase Auth
- Log in and open the dashboard
- Browse published courses
- Start Stripe test checkout from a course detail page
- Confirm the webhook creates an order and enrollment
- Open an enrolled lesson
- Mark a lesson as completed
- Ask the assistant a question covered by the current lesson
- Ask the assistant a question not covered by the current lesson
- Promote a user to `admin` in `profiles`
- Create, edit, publish, and delete a course
- Create, edit, and delete modules
- Create, edit, and delete lessons
- Confirm admin pages reject non-admin users

## Known Limitations

- Stripe is configured for test mode only
- AI assistant is limited to lesson/course content
- No real video hosting integration
- No production email setup
- No advanced analytics yet
- Subscription billing can be added later

## Future Improvements

- Subscription plans
- Certificates
- Instructor payouts
- Course reviews
- Coupon codes
- Video upload integration
- Quiz module
- Admin analytics dashboard
- Better AI tutoring with embeddings/vector search

## Support

If you find this project useful, please consider starring the repository. It helps support the project and shows employers/other developers that the work is useful.

You are free to fork the project for learning purposes. Please keep the license and attribution intact.

## License

MIT License. Copyright (c) 2026 Ritchie Fernandes.
