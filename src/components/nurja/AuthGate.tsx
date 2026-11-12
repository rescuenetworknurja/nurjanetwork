import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useSession, signOut } from "@/lib/auth";
import { getMyProfile } from "@/lib/profile.functions";
import { useDemo } from "@/lib/demo-store";

type RequiredRole = "admin" | "responder";

/**
 * Client gate for the app surfaces. Redirects signed-out visitors to /auth,
 * and when requireRole is set, verifies the role server-side via getMyProfile.
 */
export function AuthGate({
  children,
  requireRole,
  redirectTo,
}: {
  children: ReactNode;
  requireRole?: RequiredRole;
  redirectTo: string;
}) {
  const d = useDemo();
  const bn = d.lang === "bn";
  const session = useSession();
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["my-profile", session.user?.id],
    queryFn: () => getMyProfile(),
    enabled: !!session.user && !!requireRole,
    retry: false,
  });

  useEffect(() => {
    if (!session.loading && !session.user) {
      void navigate({ to: "/auth", search: { redirect: redirectTo } });
    }
  }, [session.loading, session.user, navigate, redirectTo]);

  if (session.loading || !session.user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-crimson" />
      </div>
    );
  }

  if (requireRole) {
    if (profileQuery.isPending) {
      return (
        <div className="grid min-h-screen place-items-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      );
    }
    const roles = profileQuery.data?.roles ?? [];
    const allowed =
      roles.includes(requireRole) || (requireRole === "responder" && roles.includes("admin"));
    if (!allowed) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-8 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-crimson-soft text-crimson">
            <ShieldAlert className="h-10 w-10" />
          </span>
          <p className="font-display text-xl font-extrabold text-foreground">
            {bn ? "অ্যাক্সেস নেই" : "Access denied"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {bn
              ? "এই অংশটি শুধু অনুমোদিত " +
                (requireRole === "admin" ? "অ্যাডমিন" : "রেসপন্ডার") +
                "দের জন্য। আপনার অ্যাকাউন্টে ভূমিকা যোগ করা হলে আবার চেষ্টা করুন।"
              : `This area is for approved ${requireRole === "admin" ? "admins" : "responders"} only. Try again once a role is added to your account.`}
          </p>
          <button
            onClick={() => void signOut()}
            className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent"
          >
            {bn ? "অন্য অ্যাকাউন্টে সাইন ইন" : "Sign in with another account"}
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
}
