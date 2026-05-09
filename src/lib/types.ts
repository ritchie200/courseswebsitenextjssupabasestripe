export type UserRole = "student" | "admin";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  created_at: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price_cents: number;
  difficulty: Difficulty;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url: string | null;
  order_index: number;
  is_preview: boolean;
  created_at: string;
};

export type ModuleWithLessons = CourseModule & {
  lessons: Lesson[];
};

export type CourseWithModules = Course & {
  modules: ModuleWithLessons[];
};

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  source_order_id: string | null;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  course_id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
};

export type AiChatHistory = {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  question: string;
  answer: string;
  created_at: string;
};

export type CourseStats = {
  course_id: string;
  enrollments: number;
  completed_lessons: number;
  revenue_cents: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Course, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      modules: {
        Row: CourseModule;
        Insert: Omit<CourseModule, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CourseModule, "id" | "created_at">>;
        Relationships: [];
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Lesson, "id" | "created_at">>;
        Relationships: [];
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, "id" | "enrolled_at"> & {
          id?: string;
          enrolled_at?: string;
        };
        Update: Partial<Omit<Enrollment, "id" | "enrolled_at">>;
        Relationships: [];
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Omit<LessonProgress, "id" | "completed_at"> & {
          id?: string;
          completed_at?: string;
        };
        Update: Partial<Omit<LessonProgress, "id" | "completed_at">>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Order, "id" | "created_at">>;
        Relationships: [];
      };
      ai_chat_history: {
        Row: AiChatHistory;
        Insert: Omit<AiChatHistory, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<AiChatHistory, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      difficulty_level: Difficulty;
      order_status: Order["status"];
    };
    CompositeTypes: Record<string, never>;
  };
};
