"use client";

import { useEffect, useRef, useState } from "react";
import { RaHeader } from "@/components/ra-header";
import { RaFooter } from "@/components/ra-footer";
import { useLanguage } from "@/lib/lang-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ConversationTurn = { role: "user" | "assistant"; content: string };

const GREETINGS = {
  he: "שלום! אני Resolve, הנציג החכם של ResolveAI 👋\n\nאשמח לענות על כל שאלה בנוגע לפלטפורמה, התהליך, התמחור, או כל נושא אחר. כיצד אוכל לסייע לך היום?",
  en: "Hello! I'm Resolve, ResolveAI's smart assistant 👋\n\nI'm here to answer any questions about the platform, process, pricing, or anything else. How can I help you today?",
};

function ChatBubble({
  msg,
  isRtl,
}: {
  msg: Message;
  isRtl: boolean;
}) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? (isRtl ? "flex-row-reverse" : "flex-row-reverse") : "flex-row"} items-end`}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{
            backgroundColor: "var(--ra-gold-500)",
            color: "var(--ra-navy-950)",
            fontFamily: "var(--font-sans)",
          }}
        >
          ⚖
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? "rounded-br-sm" : "rounded-bl-sm"
        }`}
        style={
          isUser
            ? {
                backgroundColor: "var(--ra-navy-800)",
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-sans)",
              }
            : {
                backgroundColor: "white",
                color: "hsl(215 20% 25%)",
                fontFamily: "var(--font-sans)",
                border: "1px solid hsl(42 30% 88%)",
              }
        }
      >
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs"
        style={{ backgroundColor: "var(--ra-gold-500)", color: "var(--ra-navy-950)" }}
      >
        ⚖
      </div>
      <div
        className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center"
        style={{ backgroundColor: "white", border: "1px solid hsl(42 30% 88%)" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: "var(--ra-gold-500)",
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { lang } = useLanguage();
  const isRtl = lang === "he";

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETINGS[lang] },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update greeting when language changes
  useEffect(() => {
    setMessages([{ role: "assistant", content: GREETINGS[lang] }]);
    setConversationHistory([]);
  }, [lang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [input]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMsg: Message = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
      setConversationHistory(data.conversationHistory);
    } catch (err) {
      const errText =
        lang === "he"
          ? "אירעה שגיאה. אנא נסו שנית."
          : "Something went wrong. Please try again.";
      setError(errText);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const placeholder =
    lang === "he"
      ? "כתבו את שאלתכם כאן... (Enter לשליחה, Shift+Enter לשורה חדשה)"
      : "Type your question here... (Enter to send, Shift+Enter for new line)";

  const sendLabel = lang === "he" ? "שלח" : "Send";
  const pageTitle = lang === "he" ? "שירות לקוחות" : "Customer Support";
  const pageSubtitle =
    lang === "he"
      ? "נציג AI חכם זמין עבורכם 24/7. כל שאלה, בכל עת."
      : "Our smart AI representative is available 24/7. Any question, any time.";
  const whatsappLabel =
    lang === "he"
      ? "צרו קשר גם בוואטסאפ"
      : "You can also reach us on WhatsApp";
  const emailLabel =
    lang === "he" ? "או שלחו מייל ל:" : "Or email us at:";

  return (
    <>
      <RaHeader />

      <main
        className="flex-1 flex flex-col"
        style={{ backgroundColor: "var(--ra-cream-50)" }}
      >
        {/* Page Header */}
        <div
          className="border-b py-10"
          style={{
            backgroundColor: "var(--ra-navy-950)",
            borderColor: "hsl(215 45% 18%)",
          }}
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p
              className="text-xs tracking-[0.25em] uppercase mb-3"
              style={{
                color: "var(--ra-gold-300)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {lang === "he" ? "תמיכה" : "Support"}
            </p>
            <h1
              className="text-3xl md:text-4xl font-light mb-3"
              style={{
                color: "var(--ra-cream-50)",
                fontFamily: "var(--font-display)",
              }}
            >
              {pageTitle}
            </h1>
            <p
              className="text-sm"
              style={{
                color: "hsl(40 28% 65%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {pageSubtitle}
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-3xl w-full mx-auto px-4 py-8 flex flex-col flex-1 gap-0">
          {/* Chat Window */}
          <div
            className="flex-1 flex flex-col rounded-t-xl overflow-hidden"
            style={{
              border: "1px solid hsl(42 30% 85%)",
              borderBottom: "none",
              minHeight: "420px",
              maxHeight: "520px",
            }}
          >
            {/* Chat header */}
            <div
              className="px-5 py-3 flex items-center gap-3 border-b shrink-0"
              style={{
                backgroundColor: "var(--ra-navy-950)",
                borderColor: "hsl(215 45% 20%)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: "var(--ra-gold-500)", color: "var(--ra-navy-950)" }}
              >
                ⚖
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--ra-cream-50)", fontFamily: "var(--font-sans)" }}
                >
                  Resolve
                </p>
                <p
                  className="text-xs"
                  style={{ color: "hsl(42 30% 55%)", fontFamily: "var(--font-sans)" }}
                >
                  {lang === "he" ? "נציג ResolveAI • מקוון" : "ResolveAI Agent • Online"}
                </p>
              </div>
              <div
                className="ms-auto w-2 h-2 rounded-full"
                style={{ backgroundColor: "hsl(142 60% 50%)" }}
              />
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
              dir={isRtl ? "rtl" : "ltr"}
              style={{ backgroundColor: "hsl(42 30% 97%)" }}
            >
              {messages.map((msg, i) => (
                <ChatBubble key={i} msg={msg} isRtl={isRtl} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div
            className="rounded-b-xl"
            style={{
              border: "1px solid hsl(42 30% 85%)",
              borderTop: "none",
              backgroundColor: "white",
            }}
          >
            {error && (
              <div
                className="px-4 py-2 text-xs border-b"
                style={{
                  color: "hsl(0 65% 40%)",
                  backgroundColor: "hsl(0 80% 97%)",
                  borderColor: "hsl(0 60% 88%)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {error}
              </div>
            )}
            <div className="flex gap-3 p-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                rows={1}
                dir={isRtl ? "rtl" : "ltr"}
                className="flex-1 resize-none outline-none text-sm leading-relaxed py-2 px-1 bg-transparent"
                style={{
                  color: "hsl(215 20% 25%)",
                  fontFamily: "var(--font-sans)",
                  maxHeight: "140px",
                  overflowY: "auto",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="shrink-0 px-5 py-2.5 text-xs tracking-[0.1em] uppercase font-semibold transition-all rounded-lg disabled:opacity-40"
                style={{
                  backgroundColor:
                    isLoading || !input.trim()
                      ? "hsl(215 20% 70%)"
                      : "var(--ra-navy-800)",
                  color: "var(--ra-cream-50)",
                  fontFamily: "var(--font-sans)",
                  cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "..." : sendLabel}
              </button>
            </div>
          </div>

          {/* Contact alternatives */}
          <div
            className="mt-8 pt-8 border-t text-center"
            style={{ borderColor: "var(--ra-gold-100)" }}
          >
            <p
              className="text-xs mb-4"
              style={{
                color: "hsl(215 15% 55%)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {lang === "he"
                ? "מעדיפים ליצור קשר בדרך אחרת?"
                : "Prefer another way to reach us?"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="https://wa.me/14155238886"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.1em] uppercase font-semibold rounded transition-colors"
                style={{
                  backgroundColor: "hsl(142 60% 45%)",
                  color: "white",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span>📱</span>
                <span>WhatsApp</span>
              </a>
              <a
                href="mailto:support@resolveai.co.il"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.1em] uppercase font-semibold rounded border transition-colors"
                style={{
                  borderColor: "var(--ra-gold-300)",
                  color: "hsl(215 30% 38%)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <span>✉️</span>
                <span>support@resolveai.co.il</span>
              </a>
            </div>
            <p
              className="text-xs mt-6"
              style={{ color: "hsl(215 15% 65%)", fontFamily: "var(--font-sans)" }}
            >
              {lang === "he"
                ? "תגובה תוך יום עסקים אחד לכל היותר."
                : "Response within 1 business day."}
            </p>
          </div>
        </div>
      </main>

      <RaFooter />
    </>
  );
}
