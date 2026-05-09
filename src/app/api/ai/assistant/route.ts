import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  anthropicConfig,
  isAnthropicConfigured,
  isSupabaseConfigured
} from "@/lib/config";
import { getLessonContext } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function mockAnswer(question: string, context: string) {
  const words = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 4);

  const lowerContext = context.toLowerCase();
  const hasOverlap = words.some((word) => lowerContext.includes(word));

  if (!hasOverlap) {
    return "That information is not covered in the current lesson.";
  }

  const firstSentence =
    context
      .split(/(?<=[.!?])\s+/)
      .find((sentence) =>
        words.some((word) => sentence.toLowerCase().includes(word))
      ) ?? context.split(/(?<=[.!?])\s+/)[0];

  return `Mock assistant response because ANTHROPIC_API_KEY is not configured: ${firstSentence}`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        courseSlug?: string;
        lessonId?: string;
        question?: string;
      }
    | null;

  const courseSlug = body?.courseSlug;
  const lessonId = body?.lessonId;
  const question = body?.question?.trim();

  if (!courseSlug || !lessonId || !question) {
    return NextResponse.json(
      { error: "courseSlug, lessonId, and question are required." },
      { status: 400 }
    );
  }

  if (question.length > 1200) {
    return NextResponse.json(
      { error: "Questions must be 1200 characters or less." },
      { status: 400 }
    );
  }

  const [profile, context] = await Promise.all([
    getCurrentProfile(),
    getLessonContext(courseSlug, lessonId)
  ]);

  if (isSupabaseConfigured && !profile) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  if (!context) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const sourceContext = [
    `Course: ${context.course.title}`,
    `Course description: ${context.course.description}`,
    `Module: ${context.module.title}`,
    `Lesson: ${context.lesson.title}`,
    `Lesson content: ${context.lesson.content}`
  ].join("\n\n");

  let answer: string;

  if (!isAnthropicConfigured || !anthropicConfig.apiKey) {
    answer = mockAnswer(question, sourceContext);
  } else {
    const anthropic = new Anthropic({
      apiKey: anthropicConfig.apiKey
    });

    const response = await anthropic.messages.create({
      model: anthropicConfig.model,
      max_tokens: 500,
      temperature: 0,
      system:
        "You are a course assistant. Answer only from the supplied course and lesson content. If the answer is not in the supplied content, say: The information is not covered in the current lesson. Do not invent course material.",
      messages: [
        {
          role: "user",
          content: `Source material:\n${sourceContext}\n\nStudent question:\n${question}`
        }
      ]
    });

    answer = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!answer) {
      answer = "The information is not covered in the current lesson.";
    }
  }

  const supabase = await createSupabaseServerClient();

  if (supabase && profile) {
    await supabase.from("ai_chat_history").insert({
      user_id: profile.id,
      course_id: context.course.id,
      lesson_id: context.lesson.id,
      question,
      answer
    });
  }

  return NextResponse.json({ answer });
}
