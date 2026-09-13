"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSkeleton } from "@/components/ui/Skeleton";

/** "Explore Live Demo" entry point — loads Royal Massage & Spa immediately. */
export default function DemoPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app");
  }, [router]);
  return (
    <div className="mx-auto max-w-5xl p-6">
      <PageSkeleton />
    </div>
  );
}
