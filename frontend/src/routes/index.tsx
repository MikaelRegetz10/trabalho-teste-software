import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const router = useRouter();
  const token = useApp((s) => s.token);
  useEffect(() => {
    router.navigate({ to: token ? "/dashboard" : "/login" });
  }, [router, token]);
  return <div className="min-h-screen bg-background" />;
}
