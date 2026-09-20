"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type AuthFormState } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signInAction,
    undefined,
  );

  return (
    <div className="mx-auto grid w-full max-w-sm gap-6 py-8">
      <div className="grid gap-1">
        <h1 className="font-heading text-2xl font-medium">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to identify yourself in this app.
        </p>
      </div>
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
          />
        </div>
        {state?.error ? (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        ) : null}
        <Button type="submit" disabled={pending}>
          Sign in
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/signup" className="text-foreground underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}