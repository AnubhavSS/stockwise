/** App entry: send operators to the dashboard. */
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <p className="text-sm text-muted-foreground">
        Continue to{" "}
        <Link href="/dashboard" className="font-medium text-primary underline-offset-4 hover:underline">
          the dashboard
        </Link>
        .
      </p>
    </main>
  );
}
