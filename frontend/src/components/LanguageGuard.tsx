"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface LanguageGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function LanguageGuard({ children, fallback }: LanguageGuardProps) {
  const { isLanguageSelected } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isLanguageSelected) {
      router.push('/language-select');
    }
  }, [isLanguageSelected, router]);

  if (!isLanguageSelected) {
    return fallback || null;
  }

  return <>{children}</>;
}
