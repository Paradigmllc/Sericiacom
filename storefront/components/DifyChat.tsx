"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Sericia Assistant chat widget.
 *
 * Rewritten from the `udify.app` embed (which was 404-ing on the current App
 * token pattern) to a custom UI backed by our own `/api/dify-chat` server proxy.
 * Benefits:
 *
 *   1. No client-side SECRET leakage — the `app-*` Dify Service API key lives
 *      only in server env (`DIFY_SERVICE_API_KEY` in Coolify). Putting it in
 *      `NEXT_PUBLIC_*` would bake the secret into every visitor's JS bundle.
 *   2. Full control of the UX — Sericia typography + color tokens + animations
 *      instead of Dify's default chrome.
 *   3. Graceful degradation — if the server-side Dify secret is unset the API
 *      route returns 503 and we render a clear "offline" state with a mailto
 *      fallback instead of a broken bubble (Rule V).
 *   4. No third-party script injection (dropped `udify.app/embed.min.js`).
 *
 * Rule E: send failures go through `toast.error` + `console.error` — no
 *   swallowed `catch {}` anywhere.
 * Rule M: uses design tokens (`sericia-accent`, `sericia-paper-card` …) instead
 *   of hardcoded hex values so palette tweaks propagate automatically.
 */

type Role = "user" | "assistant";
interface ChatMessage {
  role: Role;
  content: string;
}

interface ChatApiResponse {
  answer?: string;
  conversation_id?: string | null;
  message_id?: string | null;
  error?: string;
  detail?: string;
}

const USER_ID_KEY = "sericia-chat-user-id";
const MAX_LENGTH = 2000;

// Sericia-specific brand copy — edit these to adjust the assistant's voice.
// The Dify knowledge base is seeded with product / shipping / ceremony context
// so the model will ground its answers in Sericia content once the visitor
// sends the first real message.
const WELCOME_MESSAGE =
  "Hello — I'm the Sericia Assistant. Ask me about our teas, ceremony ware, shipping, or anything else I can help with.";
const OFFLINE_MESSAGE =
  "The assistant is temporarily offline. Please reach us at hello@sericia.com and we'll respond personally.";
const ERROR_MESSAGE =
  "Something went wrong sending your message. Please try again in a moment.";
const EMPTY_ANSWER_FALLBACK =
  "I'm not sure how to answer that — could you rephrase?";

/**
 * Stable, anonymous visitor id persisted in localStorage so Dify can thread
 * conversations per device. Not PII — pure opaque identifier. Shape:
 * `u-<uuid>` on browsers that support `crypto.randomUUID()`, otherwise a
 * timestamp-based fallback.
 */
function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  let id = window.localStorage.getItem(USER_ID_KEY);
  if (!id) {
    const random =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    id = `u-${random}`;
    window.localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export default function DifyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Seed welcome on first open + focus input so user can start typing immediately
  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
    }
    const focusTimer = window.setTimeout(
      () => textareaRef.current?.focus(),
      120,
    );
    return () => window.clearTimeout(focusTimer);
  }, [open, messages.length]);

  // Auto-scroll to bottom on new message / loading-dot transition
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const query = input.trim();
    if (!query || loading || offline) return;

    setMessages((m) => [...m, { role: "user", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/dify-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          user: getOrCreateUserId(),
          conversation_id: conversationId,
        }),
        signal: AbortSignal.timeout(40_000),
      });

      const data = (await res.json()) as ChatApiResponse;

      if (res.status === 503 && data.error === "dify_not_configured") {
        setOffline(true);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: OFFLINE_MESSAGE },
        ]);
        return;
      }

      if (!res.ok) {
        throw new Error(
          data.detail ?? data.error ?? `request failed with status ${res.status}`,
        );
      }

      if (data.conversation_id) setConversationId(data.conversation_id);
      const answer = (data.answer ?? "").trim();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: answer.length > 0 ? answer : EMPTY_ANSWER_FALLBACK,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[dify-chat] send failed", err);
      toast.error(`Chat error: ${msg}`);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: ERROR_MESSAGE },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Sericia Assistant" : "Open Sericia Assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-sericia-accent text-sericia-paper shadow-[0_12px_40px_-12px_rgba(33,35,29,0.45)] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Sericia Assistant"
          className="fixed bottom-20 right-5 z-[89] flex flex-col overflow-hidden border border-sericia-line bg-sericia-paper shadow-[0_24px_80px_-20px_rgba(33,35,29,0.35)]"
          style={{
            width: "min(22rem, calc(100vw - 2.5rem))",
            height: "min(34rem, calc(100vh - 7rem))",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sericia-line bg-sericia-accent px-4 py-3 text-sericia-paper">
            <div>
              <div className="label text-[10px] tracking-[0.22em] text-sericia-paper/70">
                Sericia
              </div>
              <div className="text-sm font-medium tracking-wide">Assistant</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1 opacity-80 transition hover:opacity-100"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] whitespace-pre-wrap px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-sericia-accent text-sericia-paper"
                      : "border border-sericia-line bg-sericia-paper-card text-sericia-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 border border-sericia-line bg-sericia-paper-card px-3 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sericia-ink-mute [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sericia-ink-mute [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sericia-ink-mute [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-sericia-line bg-sericia-paper-card p-2">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
                onKeyDown={onKeyDown}
                disabled={loading || offline}
                placeholder={
                  offline
                    ? "Assistant offline — please email hello@sericia.com"
                    : "Ask about our collection…"
                }
                rows={1}
                maxLength={MAX_LENGTH}
                className="min-h-[36px] max-h-[120px] flex-1 resize-none border border-sericia-line bg-sericia-paper px-3 py-2 text-[13px] text-sericia-ink placeholder:text-sericia-ink-mute focus:border-sericia-ink focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || offline || !input.trim()}
                aria-label="Send message"
                className="h-[36px] bg-sericia-accent px-3 text-[12px] uppercase tracking-[0.18em] text-sericia-paper transition hover:bg-sericia-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
