"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import PreLoader from "@/components/PreLoader";
import LanSelect from "@/app/language-select/page";

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [showPreloader, setShowPreloader] = useState(true);
  const { isLanguageSelected } = useLanguage();
  const { isLoading: userLoading } = useUser();

  // Hide preloader after minimum time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show preloader
  if (showPreloader) {
    return <PreLoader />;
  }

  // Show language selection if no language selected
  if (!isLanguageSelected) {
    return <LanSelect />;
  }

  // Show children (your dashboard/other pages)
  return <>{children}</>;
}
