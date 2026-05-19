import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "תנאי שימוש — תקנון השירות",
  description:
    "תנאי השימוש של ResolveAI — פלטפורמת הבוררות והגישור המקוון מבוססת בינה מלאכותית. קראו את התקנון המלא לפני השימוש בשירות.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
