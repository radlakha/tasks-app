import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Local tasks from Supabase",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
