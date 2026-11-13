import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { NurjaAuthForm } from "@/components/nurja/AuthSheet";
import { LangToggle } from "@/lib/i18n";
import { useSession } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect: string; mode?: "signup" | undefined } => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : "/NURJASOS",
    mode: search["mode"] === "signup" ? ("signup" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — NURJA" },
      { name: "description", content: "Sign in to NURJA with your phone number and password." },
      { property: "og:title", content: "Sign In — NURJA" },
      { property: "og:description", content: "Sign in to NURJA with your phone number and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const session = useSession();
  const d = useDemo();

  useEffect(() => {
    if (!session.loading && session.user) {
      void navigate({ to: redirect as never });
    }
  }, [session.loading, session.user, navigate, redirect]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4"><LangToggle /></div>
      <div className="w-full max-w-sm">
        <NurjaAuthForm
          initialMode="signin"
          lockMode
          resetMethod="email"
          onDone={() => void navigate({ to: redirect as never })}
          onSignedUp={() => d.set({ appView: "onboarding" })}
        />
      </div>
    </div>
  );
}
