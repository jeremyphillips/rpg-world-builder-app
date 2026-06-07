import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rpg/ui";

import { useSession } from "@/features/auth";

export function DashboardHome() {
  const { data: user } = useSession();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome{user ? `, ${user.displayName}` : ""}
        </h2>
        <p className="text-muted-foreground">
          This is the authenticated DM workspace shell. Campaign and content features land here in
          later phases.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            The session is gated by the auth guard — an unauthenticated visit redirects to the
            public app&apos;s login page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Nothing to build yet. The shell, routing, and session wiring are in place so feature
          slices can be added behind the guard.
        </CardContent>
      </Card>
    </div>
  );
}
