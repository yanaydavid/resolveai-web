"use client";

import { useState } from "react";
import type { CategoryFaqItem } from "@/lib/category-data";

export function CategoryFaq({ items }: { items: CategoryFaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="border"
            style={{ borderColor: "var(--ra-gold-200)", backgroundColor: "white" }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full text-start px-6 py-4 flex items-center justify-between gap-4"
              style={{ fontFamily: "var(--font-sans)", cursor: "pointer", background: "none", border: "none" }}
              aria-expanded={isOpen}
            >
              <span
                className="text-sm font-semibold leading-snug"
                style={{ color: "var(--ra-navy-900)" }}
              >
                {item.q}
              </span>
              <span
                className="shrink-0 text-lg leading-none"
                style={{ color: "var(--ra-gold-600)", transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {isOpen && (
              <div
                className="px-6 pb-5"
                style={{ borderTop: "1px solid var(--ra-gold-100)" }}
              >
                <p
                  className="text-sm leading-relaxed pt-4"
                  style={{ color: "hsl(215 20% 38%)", fontFamily: "var(--font-sans)" }}
                >
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
