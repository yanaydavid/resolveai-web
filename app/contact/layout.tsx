import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "צור קשר — תמיכה ושאלות",
  description:
    "יש לכם שאלות על בוררות מקוונת, גישור או פתרון סכסוכים? צוות התמיכה של ResolveAI זמין לענות על כל שאלה — שאלו אותנו בצ'אט.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "צור קשר | ResolveAI",
    description:
      "צוות התמיכה של ResolveAI זמין לענות על שאלות בנושא בוררות וגישור מקוון.",
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
