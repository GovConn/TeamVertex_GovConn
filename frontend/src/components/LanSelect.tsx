"use client";

import PreLoader from "@/components/PreLoader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/translations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { translations } from "@/translations"; 

export default function LanSelect() {
  const { setLanguage, isLanguageSelected } = useLanguage();
  const router = useRouter();
  const [showPreloader, setShowPreloader] = useState(true);

  // Language data with their respective text content
  const languageData: Record<Language, {
    title: string;
    description: string;
    buttonText: string;
    fontClass: string;
  }> = {
    en: {
      title: translations.en.languageSelection.title,
      description: translations.en.languageSelection.description,
      buttonText: translations.en.languageSelection.buttonText,
      fontClass: "",
    },
    si: {
      title: translations.si.languageSelection.title,
      description: translations.si.languageSelection.description,
      buttonText: translations.si.languageSelection.buttonText,
      fontClass: "font-sinhala",
    },
    ta: {
       title: translations.ta.languageSelection.title,
      description: translations.ta.languageSelection.description,
      buttonText: translations.ta.languageSelection.buttonText,
      fontClass: "font-tamil",
    },
  };

  // Hide preloader after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Redirect if language is already selected
  useEffect(() => {
    if (isLanguageSelected && !showPreloader) {
      router.push('/'); // Redirect to dashboard instead of login since language is already selected
    }
  }, [isLanguageSelected, showPreloader, router]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    // Add a small delay for better UX
    setTimeout(() => {
      router.push('/'); // Redirect to dashboard/home page
    }, 500);
  };

  if (showPreloader) {
    return <PreLoader />;
  }

  return (
    <main className="fixed inset-0 bg-white w-full min-h-screen flex flex-col items-center justify-center">
      <div className="container md:max-w-xl flex flex-col items-center justify-center px-12">
        
        {/* Language Selection Sections */}
        {(Object.keys(languageData) as Language[]).map((lang, index) => (
          <div key={lang} className="w-full">
            <div className={`text-center flex flex-col items-center justify-center gap-4 ${languageData[lang].fontClass}`}>
              <h1 className="text-4xl font-bold">
                {languageData[lang].title}
              </h1>
              <p className="mb-2 text-lg">
                {languageData[lang].description}
              </p>
              <Button 
                className="bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover py-6 w-full max-w-xs font-semibold rounded-2xl transition-colors duration-200"
                onClick={() => handleLanguageSelect(lang)}
                aria-label={`Select ${languageData[lang].buttonText} language`}
              >
                {languageData[lang].buttonText}
              </Button>
              
              {/* Add divider between sections (not after the last one) */}
              {index < Object.keys(languageData).length - 1 && (
                <div className="border-b border-gray-200 w-full my-6"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
