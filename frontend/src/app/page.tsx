"use client";

import OngoingServices from "@/components/OngoingServices";
import FeatureCard from "@/components/FeatureCard";
import { CalendarCheck, Landmark, Bot, Clock3, ChevronRight } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useUser } from "@/contexts/UserContext";
import { useHistory } from "@/contexts/HistoryContext";
import { useDashboardTranslations, useCommonTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Watermark from "@/components/Watermark";
import { ServiceItem } from "@/components/OngoingServices";

// Lightweight local card for Quick Actions
type QuickActionCardProps = {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  accent?: "yellow" | "black" | "blue" | "green";
};

const QuickActionCard = ({
  title,
  Icon,
  onClick,
  disabled = false,
  badge,
  accent = "yellow",
}: QuickActionCardProps) => {
  const accentIconBg =
    accent === "yellow"
      ? "bg-mainYellow/20 text-textBlack"
      : accent === "black"
      ? "bg-textBlack text-textWhite"
      : accent === "blue"
      ? "bg-blue-600/15 text-blue-700"
      : "bg-strokeSuccess/15 text-strokeSuccess";

  const accentRing =
    accent === "yellow"
      ? "hover:ring-mainYellow/40"
      : accent === "black"
      ? "hover:ring-textBlack/30"
      : accent === "blue"
      ? "hover:ring-blue-600/30"
      : "hover:ring-strokeSuccess/30";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full text-left rounded-2xl lg:rounded-3xl border border-strokeGrey/60 bg-bgWhite p-4 lg:p-6 shadow-sm transition-all
        hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${accentRing}
        disabled:opacity-60 disabled:cursor-not-allowed`}
      aria-label={title}
    >
      {badge && (
        <span className="absolute top-3 right-3 rounded-full bg-textBlack text-textWhite text-[10px] font-semibold px-2 py-0.5">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${accentIconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-textBlack text-base lg:text-lg">
            {title}
          </div>
          {/* Optional subtitle space kept for future translations */}
          {/* <div className="text-sm text-textGrey mt-0.5">Subtitle</div> */}
        </div>
        <ChevronRight className="h-5 w-5 text-textGrey transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
};

const Dashboard = () => {
  const { requireAuth, isAuthenticated } = useAuthGuard();
  const { user } = useUser();
  const { appointments } = useHistory();
  const t = useDashboardTranslations();
  const router = useRouter();

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GovConn",
    url: "/",
    description: "Citizen services portal for appointments and e‑services",
  } as const;

  // Handle authenticated feature clicks
  const handleFeatureClick = (href: string) => {
    requireAuth(() => {
      router.push(href);
    });
  };

  const handleHistoryClick = () => {
    requireAuth(() => {
      router.push("/history");
    });
  };

  // Handle service item clicks
  const handleServiceItemClick = (item: ServiceItem) => {
    if (item.id === 'view-all') {
      handleHistoryClick();
      return;
    }
    
    if (isAuthenticated && item.slot_id) {
      // Navigate to specific appointment details or history page
      router.push(`/history?slot=${item.slot_id}`);
    } else {
      handleHistoryClick();
    }
  };

  // Get upcoming appointments count for stats
  const upcomingAppointmentsCount = appointments.filter(apt => apt.status === 'upcoming').length;
  const completedAppointmentsCount = appointments.filter(apt => apt.status === 'completed').length;

  return (
    <div className="min-h-screen bg-bgWhite">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="sr-only">GovConn Citizen Services Portal</h1>

          {/* Non-authenticated Welcome Banner */}
          {!isAuthenticated && (
            <div className="hidden lg:block mb-12">
              <div className="bg-buttonPrimaryDisabled rounded-3xl p-8 xl:p-12 shadow-xl relative overflow-hidden">
                {/* Logo Watermark */}
                <Watermark 
                  logoUrl="/images/logo.png" 
                  opacity={0.08} 
                  size="40%" 
                  position="center right"
                />
                
                <div className="max-w-4xl relative z-10">
                  <h2 className="text-3xl xl:text-4xl font-bold mb-4 text-textBlack">
                    {t('welcomeToGovConn')}
                  </h2>
                  <p className="text-xl xl:text-2xl mb-8 text-textBlack opacity-80">
                    {t('welcomeDescription')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => router.push("/login")}
                      className="bg-textBlack text-textWhite hover:bg-buttonSecondaryHover px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {t('getStartedLogin')}
                    </Button>
                    <Button
                      onClick={() => router.push("/signup")}
                      variant="outline"
                      className="border-textBlack text-textBlack hover:bg-textBlack hover:text-textWhite px-8 py-4 text-lg font-semibold rounded-2xl transition-all"
                    >
                      {t('newUserSignup')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Authenticated User Welcome */}
          {isAuthenticated && user && (
            <div className="mb-8 lg:mb-12">
              <div className="bg-buttonPrimaryDisabled rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-sm border border-strokeGrey relative overflow-hidden">
                {/* Logo Watermark */}
                <Watermark 
                  logoUrl="/images/logo.png" 
                  opacity={0.03} 
                  size="25%" 
                  position="bottom right"
                />
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10">
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-textBlack mb-2">
                      {t('welcomeBack')}, {user.first_name}!
                    </h2>
                    <p className="text-textGrey lg:text-lg">
                      {t('accessYourServices')}
                    </p>
                    {/* Quick stats for authenticated users */}
                    {appointments.length > 0 && (
                      <div className="flex gap-4 mt-3">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {upcomingAppointmentsCount} upcoming
                        </span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {completedAppointmentsCount} completed
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6  bg-black rounded-full">
                    <div className={`${user.active ? '' : 'bg-mainYellow/10 border border-mainYellow'} rounded-xl px-4 py-2 lg:px-6 lg:py-3`}>
                      <p className={`font-medium text-sm lg:text-base ${user.active ? 'text-white' : 'text-textBlack'}`}>
                        {user.active ? `✓ ${t('verifiedAccount')}` : `⏳ ${t('pendingVerification')}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Welcome for Non-authenticated */}
          {!isAuthenticated && (
            <div className="lg:hidden mb-8">
              <div className="bg-buttonPrimaryDisabled rounded-2xl p-6 border border-strokeGrey relative overflow-hidden">
                {/* Logo Watermark */}
                <Watermark 
                  logoUrl="/images/logo.png" 
                  opacity={0.04} 
                  size="35%" 
                  position="center"
                />
                
                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-textBlack mb-2">
                    {t('welcomeToGovConn')}
                  </h2>
                  <p className="text-textGrey mb-4">
                    {t('mobileWelcomeDescription')}
                  </p>
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full py-4 px-6 bg-mainYellow text-textBlack font-semibold rounded-2xl hover:bg-buttonPrimaryHover transition-colors duration-200 text-base"
                  >
                    {t('loginToContinue')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 xl:gap-12">
            
            {/* Enhanced Ongoing Services - Left Column */}
            <div className="xl:col-span-5">
              <div className="lg:sticky lg:top-8">
                <OngoingServices
                  className="p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-sm border border-strokeGrey"
                  showHistory={isAuthenticated}
                  onItemClick={handleServiceItemClick}
                  items={
                    !isAuthenticated
                      ? [
                          { id: "demo1", label: t('loginToViewServices'), status: 'available' },
                          { id: "demo2", label: t('trackApplications'), status: 'available' },
                          { id: "demo3", label: t('manageAppointments'), status: 'available' },
                        ]
                      : undefined // Will use history data when authenticated
                  }
                />
              </div>
            </div>

            {/* Feature Cards & Actions - Right Column */}
            <div className="xl:col-span-7 space-y-8 lg:space-y-12">
              
              {/* Quick Actions Header */}
              <div className="hidden lg:block">
                <h3 className="text-2xl lg:text-3xl font-bold text-textBlack mb-2">
                  {t('quickActions')}
                </h3>
                <p className="text-textGrey lg:text-lg">
                  {t('quickActionsDescription')}
                </p>
              </div>

              {/* Quick Action Cards (improved) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 auto-rows-fr">
                <QuickActionCard
                  title={t('bookAppointment')}
                  Icon={CalendarCheck}
                  onClick={() => handleFeatureClick("/appointments")}
                  accent="yellow"
                />
                <QuickActionCard
                  title={t('eServices')}
                  Icon={Landmark}
                  onClick={() => handleFeatureClick("/e-services")}
                  accent="black"
                />
                <QuickActionCard
                  title={t('aiAssistant')}
                  Icon={Bot}
                  onClick={() => handleFeatureClick("/ai-officer")}
                  badge="New"
                  accent="blue"
                />
                <QuickActionCard
                  title={t('comingSoon')}
                  Icon={Clock3}
                  disabled
                  accent="green"
                />
              </section>

              {/* Additional Services (Desktop) */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-strokeValidation/5 rounded-2xl p-6 border border-strokeValidation/20">
                    <h4 className="font-semibold text-strokeValidation mb-2">{t('needHelp')}</h4>
                    <p className="text-textGrey text-sm mb-4">
                      {t('needHelpDescription')}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleFeatureClick("/support")}
                      disabled={!isAuthenticated}
                      className="border-strokeValidation text-strokeValidation hover:bg-strokeValidation/10"
                    >
                      {t('contactSupport')}
                    </Button>
                  </div>
                  
                  <div className="bg-strokeSuccess/5 rounded-2xl p-6 border border-strokeSuccess/20">
                    <h4 className="font-semibold text-strokeSuccess mb-2">{t('trackStatus')}</h4>
                    <p className="text-textGrey text-sm mb-4">
                      {t('trackStatusDescription')}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleFeatureClick("/track")}
                      disabled={!isAuthenticated}
                      className="border-strokeSuccess text-strokeSuccess hover:bg-strokeSuccess/10"
                    >
                      {t('trackApplicationsButton')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Enhanced History Button */}
              <div className="w-full">
                <button
                  onClick={handleHistoryClick}
                  disabled={!isAuthenticated}
                  className={`w-full rounded-2xl lg:rounded-3xl py-4 lg:py-6 text-center font-semibold shadow-lg transition-all duration-200 text-base lg:text-lg ${
                    isAuthenticated
                      ? "bg-textBlack text-textWhite hover:bg-buttonSecondaryHover hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                      : "bg-bgDisabled text-textGrey cursor-not-allowed"
                  }`}
                >
                  {isAuthenticated 
                    ? `${t('viewHistory')} ${appointments.length > 0 ? `(${appointments.length})` : ''}` 
                    : t('loginToViewHistory')
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Desktop Stats Section */}
          {isAuthenticated && user && (
            <div className="hidden lg:block mt-16">
              <div className="bg-bgWhite rounded-3xl p-8 shadow-sm border border-strokeGrey">
                <h3 className="text-2xl font-bold text-textBlack mb-8">{t('accountOverview')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-strokeValidation mb-2">
                      {user.document_links?.length || 0}
                    </div>
                    <div className="text-textGrey">{t('documents')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-strokeSuccess mb-2">
                      {upcomingAppointmentsCount}
                    </div>
                    <div className="text-textGrey">{t('activeServices')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {appointments.length}
                    </div>
                    <div className="text-textGrey">{t('appointments')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-mainYellow mb-2">
                      {user.active ? "✓" : "⏳"}
                    </div>
                    <div className="text-textGrey">{t('accountStatus')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
