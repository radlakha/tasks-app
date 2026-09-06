import type { Metadata } from "next";
import { getSettings } from "@/modules/settings";
import { AppNav } from "@/components/app-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Local tasks from Supabase",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <html lang="en" className={settings.theme === "dark" ? "dark" : undefined}>
      <body className="min-h-screen antialiased">
        <AppNav theme={settings.theme} />
        <main className="mx-auto max-w-xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
