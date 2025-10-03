"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type PurchaseStatus = "pending" | "completed" | "failed" | null;

export function PurchaseWrapper({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { chatId } = useAuth();
  const params = useParams();
  const serviceId = (params?.service as string) || undefined;

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!chatId || !serviceId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/check-service?userId=${encodeURIComponent(chatId)}&serviceId=${encodeURIComponent(serviceId)}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setAllowed(false);
          return;
        }
        const data: { found: boolean; status: PurchaseStatus } = await res.json();
        setAllowed(data.found === true && data.status === "completed");
      } catch (e) {
        console.error("check-service failed", e);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [chatId, serviceId]);

  if (!chatId || !serviceId) return null;
  if (loading) return <div className="p-4 text-center">Checking purchase...</div>;
  if (!allowed) return <>{<div>Not allowed</div>}</>;
  return <>{children}</>;
}