import type {
  CourseStats,
  CourseWithModules,
  Enrollment,
  LessonProgress,
  Order,
  Profile
} from "@/lib/types";

const createdAt = "2026-05-09T00:00:00.000Z";

export const demoStudent: Profile = {
  id: "demo-student",
  full_name: "Demo Student",
  email: "student@example.com",
  role: "student",
  created_at: createdAt
};

export const demoAdmin: Profile = {
  id: "demo-admin",
  full_name: "Ritchie Fernandes",
  email: "admin@example.com",
  role: "admin",
  created_at: createdAt
};

export const demoCourses: CourseWithModules[] = [
  {
    id: "course-next-saas",
    slug: "build-a-nextjs-saas-dashboard",
    title: "Build a Next.js SaaS Dashboard",
    description:
      "Create a production-style dashboard with App Router, auth gates, relational data, and Stripe-backed purchases. The course focuses on practical architecture decisions that show up in real client work.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    price_cents: 9900,
    difficulty: "Intermediate",
    category: "Web Development",
    published: true,
    created_at: createdAt,
    updated_at: createdAt,
    modules: [
      {
        id: "module-next-foundations",
        course_id: "course-next-saas",
        title: "Project Foundations",
        order_index: 1,
        created_at: createdAt,
        lessons: [
          {
            id: "lesson-next-architecture",
            module_id: "module-next-foundations",
            title: "App Router Architecture",
            content:
              "A maintainable App Router project separates route concerns from shared data access and server-only integration logic. Pages should compose UI and fetch prepared data. Server actions and route handlers should validate input, check the authenticated user, and call Supabase or Stripe through small helper modules. This keeps private keys away from client bundles and makes admin checks easier to audit.",
            video_url: "https://video.example.com/placeholder-next-architecture",
            order_index: 1,
            is_preview: true,
            created_at: createdAt
          },
          {
            id: "lesson-next-dashboard-data",
            module_id: "module-next-foundations",
            title: "Dashboard Data Model",
            content:
              "The dashboard reads from profiles, courses, enrollments, orders, and lesson_progress. Enrollment records are created only after payment confirmation. Lesson progress is stored per user and lesson, which makes percentage calculations simple: completed lessons divided by total course lessons.",
            video_url: "https://video.example.com/placeholder-dashboard-data",
            order_index: 2,
            is_preview: false,
            created_at: createdAt
          }
        ]
      },
      {
        id: "module-next-payments",
        course_id: "course-next-saas",
        title: "Payments and Access",
        order_index: 2,
        created_at: createdAt,
        lessons: [
          {
            id: "lesson-stripe-checkout",
            module_id: "module-next-payments",
            title: "Stripe Checkout Flow",
            content:
              "A one-time course purchase starts with a server route that creates a Stripe Checkout Session in payment mode. The route should use the authenticated user, the course price from the database, and metadata containing the course id and user id. Access should not be granted from the success page alone. A verified Stripe webhook should create the order and enrollment after the payment is completed.",
            video_url: "https://video.example.com/placeholder-stripe-checkout",
            order_index: 1,
            is_preview: false,
            created_at: createdAt
          }
        ]
      }
    ]
  },
  {
    id: "course-ai-support",
    slug: "ai-course-assistant-with-claude",
    title: "AI Course Assistant with Claude",
    description:
      "Add a lesson-aware assistant that answers from course material, handles unknowns honestly, and keeps model calls on the server. This course avoids vague chatbot demos and focuses on bounded assistant behavior.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    price_cents: 7900,
    difficulty: "Advanced",
    category: "AI Engineering",
    published: true,
    created_at: createdAt,
    updated_at: createdAt,
    modules: [
      {
        id: "module-ai-grounding",
        course_id: "course-ai-support",
        title: "Grounded Assistant Design",
        order_index: 1,
        created_at: createdAt,
        lessons: [
          {
            id: "lesson-ai-bounds",
            module_id: "module-ai-grounding",
            title: "Answer Only From Lesson Content",
            content:
              "The assistant receives the current course title, course description, lesson title, and lesson content. Its system instructions require it to answer only from that context. If the requested information is absent, it should say that the information is not covered in the current lesson. This is a product constraint, not only a prompt preference.",
            video_url: "https://video.example.com/placeholder-ai-bounds",
            order_index: 1,
            is_preview: true,
            created_at: createdAt
          },
          {
            id: "lesson-ai-history",
            module_id: "module-ai-grounding",
            title: "Saving Chat History",
            content:
              "A useful course assistant stores the user id, course id, lesson id, question, answer, and timestamp. Chat history should be written by the server after a response is generated. Row-level security should let students read only their own assistant history.",
            video_url: "https://video.example.com/placeholder-ai-history",
            order_index: 2,
            is_preview: false,
            created_at: createdAt
          }
        ]
      }
    ]
  },
  {
    id: "course-supabase-commerce",
    slug: "supabase-commerce-data-models",
    title: "Supabase Commerce Data Models",
    description:
      "Design relational tables, row-level security, admin operations, and audit-friendly records for a small education commerce product.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    price_cents: 6900,
    difficulty: "Beginner",
    category: "Backend",
    published: true,
    created_at: createdAt,
    updated_at: createdAt,
    modules: [
      {
        id: "module-supabase-schema",
        course_id: "course-supabase-commerce",
        title: "Schema and RLS",
        order_index: 1,
        created_at: createdAt,
        lessons: [
          {
            id: "lesson-rls-basics",
            module_id: "module-supabase-schema",
            title: "RLS Policies for Course Access",
            content:
              "Public users can read published courses and preview lessons. Enrolled students can read lessons in courses where an enrollment exists for their user id. Admin users can manage course content through server-validated actions and RLS policies that check the role stored in profiles.",
            video_url: "https://video.example.com/placeholder-rls-basics",
            order_index: 1,
            is_preview: true,
            created_at: createdAt
          }
        ]
      }
    ]
  }
];

export const demoEnrollments: Enrollment[] = [
  {
    id: "enrollment-demo-next",
    user_id: demoStudent.id,
    course_id: "course-next-saas",
    enrolled_at: createdAt,
    source_order_id: "order-demo-next"
  }
];

export const demoProgress: LessonProgress[] = [
  {
    id: "progress-demo-architecture",
    user_id: demoStudent.id,
    lesson_id: "lesson-next-architecture",
    completed_at: createdAt
  }
];

export const demoOrders: Order[] = [
  {
    id: "order-demo-next",
    user_id: demoStudent.id,
    course_id: "course-next-saas",
    stripe_checkout_session_id: "cs_test_demo",
    stripe_payment_intent_id: "pi_test_demo",
    amount_cents: 9900,
    currency: "usd",
    status: "paid",
    created_at: createdAt
  }
];

export const demoStats: CourseStats[] = [
  {
    course_id: "course-next-saas",
    enrollments: 128,
    completed_lessons: 86,
    revenue_cents: 1267200
  },
  {
    course_id: "course-ai-support",
    enrollments: 74,
    completed_lessons: 31,
    revenue_cents: 584600
  },
  {
    course_id: "course-supabase-commerce",
    enrollments: 51,
    completed_lessons: 22,
    revenue_cents: 351900
  }
];

export function findDemoCourseBySlug(slug: string) {
  return demoCourses.find((course) => course.slug === slug) ?? null;
}

export function findDemoCourseById(id: string) {
  return demoCourses.find((course) => course.id === id) ?? null;
}

export function findDemoLesson(lessonId: string) {
  for (const course of demoCourses) {
    for (const courseModule of course.modules) {
      const lesson = courseModule.lessons.find((item) => item.id === lessonId);
      if (lesson) {
        return { course, module: courseModule, lesson };
      }
    }
  }

  return null;
}
