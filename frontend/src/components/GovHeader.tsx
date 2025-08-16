"use client"
import { Bell, Globe } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCommonTranslations } from "@/hooks/useTranslations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationPopup from "@/components/NotificationComponents";

const GovHeader = () => {
  const { user, isAuthenticated } = useUser();
  const { unreadCount, isPopupOpen, setIsPopupOpen } = useNotifications();
  const { language, setLanguage } = useLanguage();
  const t = useCommonTranslations();

  // Language options
  const languages = [
    { code: 'en', name: 'English', localName: 'English' },
    { code: 'si', name: 'Sinhala', localName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', localName: 'தமிழ்' }
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || "";
    return firstInitial + lastInitial || "U";
  };

  const getCurrentLanguageName = () => {
    const currentLang = languages.find(lang => lang.code === language);
    return currentLang?.localName || 'English';
  };

  const handleNotificationClick = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8  mb-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-4 sm:py-0">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="GovConn Logo"
                  width={120}
                  height={60}
                  priority
                  className="object-contain sm:w-[140px] sm:h-[70px] md:w-[160px] md:h-[80px] lg:w-[180px] lg:h-[90px]"
                />
              </Link>
              
  
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-2 sm:px-3 py-2 gap-1 sm:gap-2"
                    aria-label="Change language"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs sm:text-sm">
                      {getCurrentLanguageName()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-mainYellow shadow-2xl">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as 'en' | 'si' | 'ta')}
                      className={`cursor-pointer ${language === lang.code ? 'bg-buttonPrimaryDisabled' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{lang.localName}</span>
                        <span className="text-xs text-gray-500">{lang.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Authenticated User Section */}
              {isAuthenticated && user ? (
                <>
                  {/* Desktop User Info */}
                  <div className="hidden md:flex flex-col items-end mr-2 lg:mr-4">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px] lg:max-w-[200px]">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[150px] lg:max-w-[200px]">
                      {user.email}
                    </span>
                  </div>

                  {/* Notifications Button */}
                  <button
                    onClick={handleNotificationClick}
                    aria-label={t('notifications')}
                    className={`relative rounded-full border border-gray-200 bg-white p-2 sm:p-2.5 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md ${isPopupOpen ? 'bg-gray-50' : ''}`}
                  >
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    {/* Notification Badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      </span>
                    )}
                  </button>

                  {/* Profile Avatar */}
                  <Link
                    href="/profile"
                    aria-label={t('profile')}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm hover:shadow-md ring-2 ring-white"
                  >
                    {getUserInitials()}
                  </Link>
                </>
              ) : (
                /* Non-authenticated User Section */
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Desktop Login/Signup Buttons */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2"
                      >
                        {t('login')}
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        size="sm"
                        className="bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover px-4 py-2"
                      >
                        {t('signup')}
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile Login Button */}
                  <div className="sm:hidden">
                    <Link href="/login">
                      <Button
                        size="sm"
                        className="bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover px-3 py-2 text-xs"
                      >
                        {t('login')}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button - only show when authenticated */}
              {isAuthenticated && (
                <button
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  aria-label={t('menu')}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Popup */}
      <NotificationPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  );
};

export default GovHeader;
