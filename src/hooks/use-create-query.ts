"use client";

/**
 * Opens a create sheet when the URL has ?create=1 (from Dashboard quick actions).
 * Avoids useSearchParams(), which can suspend forever with instant navigation.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useCreateQuery(pathname: string) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") {
      setOpen(true);
    }
  }, []);

  function setCreateOpen(next: boolean) {
    setOpen(next);
    if (!next && new URLSearchParams(window.location.search).get("create") === "1") {
      router.replace(pathname);
    }
  }

  return [open, setCreateOpen] as const;
}
