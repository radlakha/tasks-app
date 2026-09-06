"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/modules/settings/components/theme-toggle";
import type { ThemePreference } from "@/modules/settings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Tasks" },
  { href: "/archived", label: "Archived Tasks" },
  { href: "/settings", label: "Settings" },
];

export function AppNav({ theme }: { theme: ThemePreference }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
        <nav className="sr-only" aria-label="Main">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Move between tasks, archive, and settings.
              </SheetDescription>
            </SheetHeader>
            <nav className="grid gap-1 px-4" aria-label="Menu">
              {links.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </nav>
            <Separator />
            <div className="px-4 pb-4">
              <ThemeToggle theme={theme} />
            </div>
          </SheetContent>
        </Sheet>
        <p className="font-heading text-sm font-medium">Tasks</p>
      </div>
    </header>
  );
}
