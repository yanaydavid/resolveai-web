import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "פתיחת תיק בוררות — הגשת תביעה מקוונת",
  description:
    "פתחו תיק בוררות מקוון ב-ResolveAI בדקות. הגישו סכסוך עסקי, הפרת חוזה, תביעת נדל\"ן או כל מחלוקת אחרת — ללא עורכי דין, מ-₪299 לתיק.",
  alternates: {
    canonical: "/new",
  },
  openGraph: {
    title: "פתיחת תיק בוררות | ResolveAI",
    description:
      "הגישו סכסוך לבוררות מקוונת מבוססת AI. ללא עורכי דין, ללא המתנה. מ-₪299 לתיק.",
  },
};

export default function NewLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
