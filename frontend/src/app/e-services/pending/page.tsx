"use client";

import { Bell, HelpCircle, ChevronRight, Clock, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';

interface PendingApplicationData {
  serviceId: string;
  serviceTitle: string;
  applicationId: string;
  submittedAt: Date;
  estimatedProcessingTime: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  statusMessage: string;
}

// Create a loading component
function PendingPageLoading() {
  return (
    <div className="min-h-screen bg-bgWhite flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-textGrey">Loading application form...</p>
      </div>
    </div>
  );
}


// Wrap your main component
export default function PendingPageWrapper() {
  return (
    <Suspense fallback={<PendingPageLoading />}>
      {/* Overlay background for popup */}
      <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
        {/* Centered modal with scroll and desktop width */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-2 sm:px-4">
            <PendingPage />
          </div>
        </div>
      </div>
    </Suspense>
  );
}

function PendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applicationData, setApplicationData] = useState<PendingApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const serviceId = searchParams.get('serviceId');
  const applicationId = searchParams.get('applicationId');

  // Simulate real-time time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch application status data
  useEffect(() => {
    const fetchPendingData = async () => {
      if (!serviceId || !applicationId) {
        router.push('/e-services');
        return;
      }

      setIsLoading(true);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        const data = await getPendingApplicationData(serviceId, applicationId);
        setApplicationData(data);
      } catch (error) {
        console.error('Error fetching pending data:', error);
        router.push('/e-services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingData();
  }, [serviceId, applicationId, router]);

  // Mock pending data based on service ID
  const getPendingApplicationData = async (sId: string, appId: string): Promise<PendingApplicationData> => {
    const pendingDataMap: Record<string, Omit<PendingApplicationData, 'applicationId' | 'submittedAt'>> = {
      'business-income-tax': {
        serviceId: 'business-income-tax',
        serviceTitle: 'Business Income Tax Registration',
        estimatedProcessingTime: 'within 5-7 business days',
        status: 'pending',
        statusMessage: 'The documents have been submitted successfully. You can check the progress from the home page.'
      },
      'pension-gratuity': {
        serviceId: 'pension-gratuity',
        serviceTitle: 'Pension & Gratuity Claims',
        estimatedProcessingTime: 'within 4-6 weeks',
        status: 'pending',
        statusMessage: 'Your pension claim has been submitted and is being processed by the relevant department.'
      },
      'starting-business': {
        serviceId: 'starting-business',
        serviceTitle: 'Starting a New Business',
        estimatedProcessingTime: 'within 10-15 business days',
        status: 'pending',
        statusMessage: 'Your business registration application is under review. You will be notified of any additional requirements.'
      }
    };

    const baseData = pendingDataMap[sId] || pendingDataMap['business-income-tax'];
    
    return {
      ...baseData,
      applicationId: appId,
      submittedAt: new Date()
    };
  };

  const formatTimeElapsed = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewApplications = () => {
    router.push('/my-applications');
  };

  const handleGetHelp = () => {
    router.push('/ai-officer');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4 bg-bgWhite rounded-2xl shadow-2xl px-6 py-12 w-full max-w-lg sm:max-w-xl">
          <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-textGrey">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center space-y-4 bg-bgWhite rounded-2xl shadow-2xl px-6 py-12 w-full max-w-lg sm:max-w-xl">
          <p className="text-textBlack text-lg">Application not found</p>
          <Link href="/e-services" className="text-mainYellow hover:underline">
            Return to E-Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Popup modal container with reduced height and extended width
    <div className="relative w-full max-w-lg lg:max-w-xl xl:max-w-2xl bg-bgWhite rounded-lg shadow-xl mx-auto my-8 z-50 flex flex-col overflow-hidden max-h-[90vh]">
      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-textGrey hover:text-textBlack transition-colors z-10"
          onClick={() => window.history.back()}
          aria-label="Close"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Main Content */}
        <main className="flex flex-col items-center justify-center px-4 pt-10 pb-4 sm:px-8">
          <div className="w-full space-y-8 text-center">
            {/* Pending Status */}
            <div className="space-y-6">
              <div className="w-20 h-20 bg-mainYellow rounded-full flex items-center justify-center mx-auto relative">
                <div className="w-6 h-6 border-4 border-textBlack border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-textBlack rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-textWhite" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-textBlack sm:text-4xl">
                  Pending!
                </h1>
                <div className="space-y-3">
                  <p className="text-base text-textBlack leading-relaxed sm:text-lg px-4">
                    {applicationData.statusMessage}
                  </p>
                  {/* Processing Time Info */}
                  <div className="bg-bgDisabled/30 rounded-2xl p-4 text-left max-w-xl mx-auto">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-textGrey">Service:</span>
                        <span className="font-medium text-textBlack">
                          {applicationData.serviceTitle}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-textGrey">Application ID:</span>
                        <span className="font-medium text-textBlack">
                          #{applicationData.applicationId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-textGrey">Submitted:</span>
                        <span className="font-medium text-textBlack">
                          {applicationData.submittedAt.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-textGrey">Expected Response:</span>
                        <span className="font-medium text-textBlack">
                          {applicationData.estimatedProcessingTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-strokeGrey/30">
                        <span className="text-textGrey">Processing Time:</span>
                        <div className="flex items-center gap-2 text-mainYellow font-medium">
                          <Clock className="h-4 w-4" />
                          {formatTimeElapsed(timeElapsed)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* User Dashboard Card */}
        <div className="px-4 pb-4 sm:px-8">
          <div className="w-full">
            <div className="bg-bgWhite border-2 border-strokeGrey rounded-2xl p-4 shadow-lg">
              {/* User Info Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-textBlack rounded-full flex items-center justify-center text-textWhite font-bold text-lg">
                    S
                  </div>
                  <div>
                    <p className="text-sm text-textGrey">Welcome</p>
                    <p className="font-semibold text-textBlack text-lg">Sahan</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 bg-textBlack rounded-full flex items-center justify-center relative">
                    <Bell className="h-5 w-5 text-textWhite" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-strokeError rounded-full"></div>
                  </button>
                  <button 
                    onClick={handleGetHelp}
                    className="w-10 h-10 bg-textBlack rounded-full flex items-center justify-center"
                  >
                    <HelpCircle className="h-5 w-5 text-textWhite" />
                  </button>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="space-y-3">
                <div className="bg-mainYellow rounded-2xl p-1">
                  <h3 className="text-center text-textBlack font-semibold text-lg py-2">
                    Upcoming
                  </h3>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={handleViewApplications}
                    className="w-full flex items-center justify-between bg-bgWhite border border-strokeGrey rounded-2xl px-4 py-3 hover:bg-bgDisabled transition-colors group"
                  >
                    <span className="font-medium text-textBlack">Appointments</span>
                    <ChevronRight className="h-4 w-4 text-textGrey group-hover:text-textBlack transition-colors" />
                  </button>
                  <button 
                    onClick={handleViewApplications}
                    className="w-full flex items-center justify-between bg-bgWhite border border-strokeGrey rounded-2xl px-4 py-3 hover:bg-bgDisabled transition-colors group"
                  >
                    <span className="font-medium text-textBlack">Applications</span>
                    <ChevronRight className="h-4 w-4 text-textGrey group-hover:text-textBlack transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="px-4 pb-6 sm:px-8">
          <div className="w-full">
            <button
              onClick={handleGoHome}
              className="w-full py-4 px-6 bg-mainYellow text-textBlack font-semibold rounded-full hover:bg-buttonPrimaryHover transition-colors text-base sm:text-lg shadow-md hover:shadow-lg"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
