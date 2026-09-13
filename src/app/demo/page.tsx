"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useDemoStore } from "@/lib/store/demoStore";

/** "Explore Live Demo" — marks this browser as demo mode and opens Royal Massage & Spa. */
export default function DemoPage() {
  const router = useRouter();
  const setMode = useDemoStore((s) => s.setMode);
  useEffect(() => {
    document.cookie = "br_demo=1; path=/; max-age=31536000; samesite=lax";
    setMode("demo");
    router.replace("/app");
  }, [router, setMode]);
  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageSkeleton />
    </div>
  );
}
