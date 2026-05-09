"use client";

import { FormEvent, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AiAssistant({
  courseSlug,
  lessonId
}: {
  courseSlug: string;
  lessonId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask about this lesson. I will answer only from the course and lesson content."
    }
  ]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    setMessages((items) => [...items, { role: "user", content: trimmed }]);
    setQuestion("");
    setPending(true);

    const response = await fetch("/api/ai/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        courseSlug,
        lessonId,
        question: trimmed
      })
    });

    const payload = (await response.json()) as { answer?: string; error?: string };
    setMessages((items) => [
      ...items,
      {
        role: "assistant",
        content:
          payload.answer ??
          payload.error ??
          "The assistant could not answer that question right now."
      }
    ]);
    setPending(false);
  }

  return (
    <section className="surface grid min-h-[520px] grid-rows-[auto_1fr_auto] overflow-hidden">
      <div className="border-b border-[#ded8cc] p-4">
        <div className="flex items-center gap-2">
          <Bot size={19} aria-hidden />
          <h2 className="font-black">Course assistant</h2>
        </div>
      </div>

      <div className="grid content-start gap-3 overflow-auto p-4">
        {messages.map((message, index) => (
          <div
            className={`max-w-[92%] rounded-lg px-3 py-2 text-sm leading-6 ${
              message.role === "user"
                ? "ml-auto bg-[#137c70] text-white"
                : "bg-[#efe8dc] text-[#23302c]"
            }`}
            key={`${message.role}-${index}`}
          >
            {message.content}
          </div>
        ))}
        {pending ? (
          <div className="flex items-center gap-2 text-sm font-bold text-[#5f6864]">
            <Loader2 className="animate-spin" size={16} aria-hidden />
            Thinking
          </div>
        ) : null}
      </div>

      <form className="flex gap-2 border-t border-[#ded8cc] p-3" onSubmit={submit}>
        <input
          className="input min-w-0 flex-1"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about this lesson"
          value={question}
        />
        <button className="button" disabled={pending} title="Send question" type="submit">
          <Send size={17} aria-hidden />
        </button>
      </form>
    </section>
  );
}
