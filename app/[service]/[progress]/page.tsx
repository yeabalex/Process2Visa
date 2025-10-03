"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthWrapper from "@/components/auth-wrapper";
import LoginPage from "@/components/login";
import { PurchaseWrapper } from "@/components/purchase-wrapper";
import { CourseProgress } from "@/components/course-progress";
import type { CourseModule } from "@/types/course";
import { useAuth } from "@/context/AuthContext";

export default function ProgressPage() {
  return (
    <AuthWrapper
      fallback={<LoginPage />}
      children={
        <PurchaseWrapper>
          <ProgressInner />
        </PurchaseWrapper>
      }
    />
  );
}

function ProgressInner() {
  const params = useParams();
  const router = useRouter();
  const { chatId } = useAuth();
  const serviceId = (params?.service as string) || "";
  const progressParam = (params?.progress as string) || "1";
  const progressNum = useMemo(() => {
    const n = Number(progressParam);
    return Number.isFinite(n) ? n : 1;
  }, [progressParam]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!chatId || !serviceId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/get-course?userId=${encodeURIComponent(chatId)}&serviceId=${encodeURIComponent(serviceId)}&progress=${encodeURIComponent(String(progressNum))}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || "Failed to fetch course");
        }
        const data = await res.json();
        setModules(data.module || []);
        setTitle(`Step ${data.progress}`);
        setSubtitle(data.country ? `Country: ${data.country}` : "");
      } catch (e: any) {
        setError(e?.message || "Error loading course");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [chatId, serviceId, progressNum]);

  const handleItemClick = (moduleId: string, itemId: string) => {
    // no-op: content renders on right panel
  };

  const handleModuleToggle = (moduleId: string) => {
    // optional: could persist expanded state if desired
  };

  const handleMarkComplete = async (moduleId: string, itemId: string) => {
    // Optional: could add additional logic here if needed
    // The CourseProgress component now handles the API call internally
    console.log(`Item completed: ${moduleId}/${itemId}`);
  };

  if (!chatId || !serviceId) return null;
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <CourseProgress
      title={title}
      subtitle={subtitle}
      modules={modules}
      onItemClick={handleItemClick}
      onModuleToggle={handleModuleToggle}
      onMarkComplete={handleMarkComplete}
      selectedItem={null}
      className=""
      userId={chatId}
      serviceId={serviceId}
      progress={progressNum}
    />
  );
}


