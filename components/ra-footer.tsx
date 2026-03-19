"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/lang-context";

export function RaFooter() {
  const { t, lang } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t py-10"
      style={{
        backgroundColor: "var(--ra-navy-950)",
        borderColor: "hsl(215 45% 18%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Image
          src="/logo3.png"
          alt="ResolveAI"
          width={320}
          height={110}
          className="object-contain"
          style={{ mixBlendMode: "screen", height: "110px", width: "auto" }}
        />

        <div className="flex flex-col sm:items-end gap-3 text-center sm:text-end">
          {/* Legal links */}
          <div className="flex gap-5">
            <Link
              href="/terms"
              className="text-xs transition-colors"
              style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--ra-gold-300)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "hsl(215 20% 45%)")
              }
            >
              {lang === "he" ? "תנאי שימוש" : "Terms of Service"}
            </Link>
            <Link
              href="/privacy"
              className="text-xs transition-colors"
              style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--ra-gold-300)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "hsl(215 20% 45%)")
              }
            >
              {lang === "he" ? "מדיניות פרטיות" : "Privacy Policy"}
            </Link>
            <Link
              href="/contact"
              className="text-xs transition-colors"
              style={{ color: "hsl(215 20% 45%)", fontFamily: "var(--font-sans)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--ra-gold-300)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "hsl(215 20% 45%)")
              }
            >
              {lang === "he" ? "צרו קשר" : "Contact"}
            </Link>
          </div>

          <p
            className="text-xs"
            style={{
              color: "hsl(215 20% 38%)",
              fontFamily: "var(--font-sans)",
            }}
          >
            &copy; {year} ResolveAI. {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}
