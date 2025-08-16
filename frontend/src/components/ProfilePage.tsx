"use client";

import { ArrowLeft, CheckCircle2, LogOut, User, FileText, Shield, Languages, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfileTranslations, useCommonTranslations } from "@/hooks/useTranslations";
import { Language } from "@/translations";

export default function ProfilePage() {
  const { user, logout, isAuthenticated, getCitizen, refreshAuth } = useUser();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const t = useProfileTranslations();
  const tc = useCommonTranslations();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const languages = [
    { value: 'en' as Language, label: 'English', localLabel: 'English' },
    { value: 'si' as Language, label: 'සිංහල', localLabel: 'සිංහල' },
    { value: 'ta' as Language, label: 'தமிழ்', localLabel: 'தமிழ்' }
  ];

  // Check if language has changed
  const hasLanguageChanged = selectedLanguage !== language;

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || "";
    const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || "";
    return firstInitial + lastInitial || "U";
  };

  // Format NIC for display
  const formatNIC = (nic: string) => {
    if (!nic) return "";
    // Add spaces every 4 characters for better readability
    return nic.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    // Format Sri Lankan phone numbers
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  };

  // Refresh user data
  const handleRefreshProfile = async () => {
    if (!user?.nic) return;
    
    try {
      setIsRefreshing(true);
      const refreshed = await refreshAuth();
      if (refreshed) {
        toast.success(t('profileRefreshed') || 'Profile refreshed successfully');
      } else {
        toast.error(t('refreshFailed') || 'Failed to refresh profile');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error(t('refreshFailed') || 'Failed to refresh profile');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast.loading(t('loggingOut'), { id: "logout" });
      
      await logout();
      
      toast.success(t('logoutSuccess'), { id: "logout" });
      router.push("/login");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('logoutFailed'), { id: "logout" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLanguageUpdate = () => {
    setLanguage(selectedLanguage);
    const selectedLangLabel = languages.find(l => l.value === selectedLanguage)?.localLabel;
    toast.success(t('languageChanged').replace('{language}', selectedLangLabel || ''));
  };

  // Auto-refresh profile data on mount
  useEffect(() => {
    if (user?.nic && isAuthenticated) {
      handleRefreshProfile();
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bgWhite">
        {/* Header with back button */}
        <header className="sticky top-0 z-10 bg-bgWhite/95 backdrop-blur border-b border-strokeGrey px-4 py-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">{t('back')}</span>
            </Link>
            
            {/* Refresh button */}
            <button
              onClick={handleRefreshProfile}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mainYellow/50 rounded-lg px-2 py-1"
              aria-label={isRefreshing ? (t('refreshing') || 'Refreshing...') : (t('refresh') || 'Refresh')}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">
                {isRefreshing ? t('refreshing') || 'Refreshing...' : t('refresh') || 'Refresh'}
              </span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-strokeGrey p-6 sm:p-8">
                  {/* Profile Avatar and Info */}
                  <div className="text-center">
                    {/* Avatar */}
                    <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-textBlack rounded-full text-textWhite text-3xl font-semibold mb-4 ring-4 ring-mainYellow/20">
                      {getUserInitials()}
                    </div>
                    
                    {/* Name */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-textBlack mb-1">
                      {user ? `${user.first_name} ${user.last_name}` : tc('loading')}
                    </h1>
                    
                    {/* NIC */}
                    <p className="text-sm sm:text-base text-textGrey mb-5">
                      {t('nicLabel')} • {user ? formatNIC(user.nic) : tc('loading')}
                    </p>
                    
                    {/* Contact and role */}
                    {user && (
                      <div className="space-y-3 mb-6">
                        <p className="text-sm sm:text-base text-textGrey">{user.email}</p>
                        <p className="text-sm sm:text-base text-textGrey">{formatPhoneNumber(user.phone)}</p>
                        {user.role && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mainYellow/15 border border-mainYellow/30">
                            <Shield className="h-3.5 w-3.5 text-textBlack" />
                            <span className="text-xs sm:text-sm text-textBlack font-medium capitalize">
                              {user.role}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification status */}
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border ${
                        user?.active
                          ? 'bg-strokeSuccess/10 text-strokeSuccess border-strokeSuccess/40'
                          : 'bg-mainYellow/10 text-textBlack border-mainYellow/40'
                      }`}
                    >
                      <span className="text-sm sm:text-base font-medium">
                        {user?.active ? t('verified') : t('pendingVerification')}
                      </span>
                      <CheckCircle2
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          user?.active ? 'text-strokeSuccess' : 'text-textBlack'
                        }`}
                      />
                    </div>

                    {/* Reference ID */}
                    {user?.reference_id && (
                      <div className="rounded-xl p-4 mb-6 bg-mainYellow/10 border border-mainYellow/30 text-left">
                        <p className="text-xs sm:text-sm text-textBlack/80 font-medium mb-1">
                          {t('referenceId')}
                        </p>
                        <p className="text-sm sm:text-base font-mono text-textBlack break-all">
                          {user.reference_id.toString().padStart(16, '0').replace(/(.{4})/g, '$1 ').trim()}
                        </p>
                      </div>
                    )}

                    {/* Account Info */}
                    {user?.created_at && (
                      <div className="pt-4 border-t border-strokeGrey/50">
                        <p className="text-xs sm:text-sm text-textGrey">
                          {t('memberSince')}{' '}
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Settings & Actions */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                
                {/* Language Selection */}
                <div className="bg-white rounded-2xl shadow-sm border border-strokeGrey p-6 sm:p-8">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Languages className="h-5 w-5 text-textBlack" />
                      <h2 className="text-xl sm:text-2xl font-semibold text-textBlack">
                        {t('changeLanguage')}
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {languages.map((lang) => {
                        const isSelected = selectedLanguage === lang.value;
                        return (
                          <button
                            key={lang.value}
                            onClick={() => setSelectedLanguage(lang.value)}
                            className={`group py-4 px-6 rounded-xl font-medium transition-all duration-200 text-base sm:text-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mainYellow/50
                              ${isSelected
                                ? "bg-textBlack text-textWhite border-textBlack shadow-lg translate-y-[-2px]"
                                : "bg-bgDisabled text-textBlack border-strokeGrey hover:bg-strokeGrey/20 hover:translate-y-[-2px]"}`
                            }
                            aria-pressed={isSelected}
                            aria-label={lang.localLabel}
                          >
                            <span className="flex items-center justify-center gap-2">
                              {lang.localLabel}
                              {isSelected && (
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-mainYellow ring-2 ring-mainYellow/30"></span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Update Language Button */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleLanguageUpdate}
                        disabled={!hasLanguageChanged}
                        className={`w-full sm:w-auto sm:min-w-[220px] py-3.5 px-6 font-semibold rounded-full transition-all duration-200 text-base sm:text-lg shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mainYellow/50
                          ${hasLanguageChanged
                            ? "bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover hover:shadow-lg"
                            : "bg-strokeGrey/40 text-textGrey cursor-not-allowed shadow-none"}`
                        }
                      >
                        {hasLanguageChanged ? t('updateLanguage') : t('selectDifferentLanguage')}
                      </button>

                      {/* Subtle hint */}
                      <span className="hidden sm:inline text-sm text-textGrey">
                        {hasLanguageChanged ? t('') ?? '' : ''}
                      </span>
                    </div>
                  </section>
                </div>

                {/* User Documents */}
                {user?.document_links && user.document_links.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-strokeGrey p-6 sm:p-8">
                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-textBlack" />
                        <h2 className="text-xl sm:text-2xl font-semibold text-textBlack">
                          {t('documents')}
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {user.document_links.map((doc, index) => (
                          <div 
                            key={index} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-bgWhite rounded-xl border border-strokeGrey hover:shadow-md transition-all hover:bg-strokeGrey/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-mainYellow/20 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-textBlack" />
                              </div>
                              <div>
                                <p className="font-medium text-sm sm:text-base capitalize text-textBlack">{doc.title}</p>
                                {doc.uploaded_at && (
                                  <p className="text-xs sm:text-sm text-textGrey">
                                    {t('uploaded')}: {new Date(doc.uploaded_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex justify-center items-center rounded-full px-4 py-2 font-medium text-sm sm:text-base bg-textBlack text-textWhite hover:bg-textBlack/90 transition-colors"
                            >
                              {t('view')}
                            </a>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* Account Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-strokeGrey p-6 sm:p-8">
                  <section className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-textBlack">
                      {t('accountActions')}
                    </h2>

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full sm:w-auto sm:min-w-[220px] py-4 px-8 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t('loggingOut')}
                        </>
                      ) : (
                        <>
                          <LogOut className="h-4 w-4" />
                          {tc('logout')}
                        </>
                      )}
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile sticky action for language update */}
        {hasLanguageChanged && (
          <div className="sm:hidden fixed bottom-4 left-0 right-0 px-4 z-20">
            <button
              onClick={handleLanguageUpdate}
              className="w-full py-3.5 px-6 bg-mainYellow text-textBlack font-semibold rounded-full shadow-lg hover:bg-buttonPrimaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mainYellow/50"
            >
              {t('updateLanguage')}
            </button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
