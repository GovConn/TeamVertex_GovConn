"use client";

import { ArrowLeft, Download } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';


interface ProcessStep {
  id: number;
  title: string;
  description: string;
  office: string;
  officeDescription?: string;
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  processSteps: ProcessStep[];
  downloadInstructions: {
    title: string;
    description: string;
  };
  estimatedTime: string;
  category: string;
}

// Create a loading component
function ServiceDetailsPageLoading() {
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
export default function ServiceDetailsPageWrapper() {
  return (
    <Suspense fallback={<ServiceDetailsPageLoading />}>
      <ServiceDetailsPage />
    </Suspense>
  );
}



 function ServiceDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceId = searchParams.get('serviceId');
  const serviceTitle = searchParams.get('title');

  // Simulate dynamic data fetching based on service ID
  useEffect(() => {
    const fetchServiceData = async () => {
      if (!serviceId) {
        setError('Service ID not provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate backend data based on service ID
        const data = await simulateBackendData(serviceId);
        setServiceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId]);

  // Simulated backend data function
  const simulateBackendData = async (id: string): Promise<ServiceData> => {
    const serviceDataMap: Record<string, ServiceData> = {
      'business-income-tax': {
        id: 'business-income-tax',
        title: "Business Income Tax Registration",
        description: "Process and offices involved",
        category: "Business",
        estimatedTime: "15-30 minutes",
        processSteps: [
          {
            id: 1,
            title: "Submit Information",
            description: "You need to provide required information and valid documents.",
            office: "Starting Point"
          },
          {
            id: 2,
            title: "Dep. of the Registrar of Companies",
            description: "This Office handles this",
            office: "Department Office"
          },
          {
            id: 3,
            title: "Processing Payments",
            description: "You should submit the payment receipt",
            office: "Payment Processing"
          },
          {
            id: 4,
            title: "Inland Revenue Department (IRD)",
            description: "This Office verifies everything.",
            office: "Final Verification"
          },
          {
            id: 5,
            title: "Finish",
            description: "You will be updated about the final state and the process will conclude.",
            office: "Completion"
          }
        ],
        downloadInstructions: {
          title: "Download Instruction",
          description: "Get detailed step-by-step instructions for this process"
        }
      },
      'pension-gratuity': {
        id: 'pension-gratuity',
        title: "Pension & Gratuity Claims",
        description: "For Government Employees - Process and offices involved",
        category: "Personal",
        estimatedTime: "20-45 minutes",
        processSteps: [
          {
            id: 1,
            title: "Submit Application",
            description: "Submit your pension/gratuity claim application with required documents.",
            office: "HR Department"
          },
          {
            id: 2,
            title: "Document Verification",
            description: "All submitted documents will be verified for authenticity.",
            office: "Verification Office"
          },
          {
            id: 3,
            title: "Calculation Process",
            description: "Pension and gratuity amounts will be calculated based on service record.",
            office: "Finance Department"
          },
          {
            id: 4,
            title: "Final Approval",
            description: "Final approval from relevant authorities.",
            office: "Approval Authority"
          },
          {
            id: 5,
            title: "Payment Processing",
            description: "Payment will be processed and you will be notified.",
            office: "Treasury"
          }
        ],
        downloadInstructions: {
          title: "Download Application Form",
          description: "Download the pension and gratuity claim application form"
        }
      },
      'starting-business': {
        id: 'starting-business',
        title: "Starting a New Business",
        description: "Complete guide and services for starting your new business venture",
        category: "Business",
        estimatedTime: "30-60 minutes",
        processSteps: [
          {
            id: 1,
            title: "Business Plan Submission",
            description: "Submit your detailed business plan with market analysis.",
            office: "Business Development Office"
          },
          {
            id: 2,
            title: "Legal Structure Selection",
            description: "Choose appropriate legal structure for your business.",
            office: "Legal Advisory"
          },
          {
            id: 3,
            title: "Registration Process",
            description: "Register your business with relevant authorities.",
            office: "Registration Office"
          },
          {
            id: 4,
            title: "Tax Registration",
            description: "Register for business taxes and obtain tax identification.",
            office: "Tax Office"
          },
          {
            id: 5,
            title: "License Issuance",
            description: "Receive your business license and commence operations.",
            office: "Licensing Authority"
          }
        ],
        downloadInstructions: {
          title: "Download Business Startup Guide",
          description: "Comprehensive guide for starting your business in Sri Lanka"
        }
      },
      'renewing-drivers-licence': {
        id: 'renewing-drivers-licence',
        title: "Renewing Drivers Licence",
        description: "Renew your driving license online with required documents",
        category: "Personal",
        estimatedTime: "10-20 minutes",
        processSteps: [
          {
            id: 1,
            title: "Document Verification",
            description: "Upload current license and required documents for verification.",
            office: "Online Portal"
          },
          {
            id: 2,
            title: "Medical Certificate",
            description: "Submit valid medical certificate if required.",
            office: "Medical Verification"
          },
          {
            id: 3,
            title: "Fee Payment",
            description: "Pay the license renewal fee through online payment.",
            office: "Payment Gateway"
          },
          {
            id: 4,
            title: "Application Review",
            description: "Your renewal application will be reviewed by DMV.",
            office: "DMV Review"
          },
          {
            id: 5,
            title: "License Delivery",
            description: "New license will be delivered to your registered address.",
            office: "Postal Service"
          }
        ],
        downloadInstructions: {
          title: "Download Renewal Checklist",
          description: "Complete checklist for driver's license renewal"
        }
      }
    };

    const data = serviceDataMap[id];
    if (!data) {
      throw new Error(`Service data not found for ID: ${id}`);
    }

    return data;
  };

  const handleStart = () => {
    if (serviceData) {
      router.push(`/e-services/application?serviceId=${serviceData.id}&step=1`);
    }
  };

  const handleDownloadInstructions = () => {
    // Simulate file download
    console.log(`Downloading instructions for service: ${serviceId}`);
    // In real implementation, this would trigger actual file download
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgWhite flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-textGrey">Loading service information...</p>
          <p className="text-sm text-textGrey">Service ID: {serviceId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bgWhite flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold text-textBlack">Service Unavailable</h2>
          <p className="text-textGrey">{error}</p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/e-services"
              className="px-4 py-2 bg-mainYellow text-textBlack rounded-full hover:bg-buttonPrimaryHover transition-colors"
            >
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-bgWhite flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-textBlack text-lg">Service information not available</p>
          <Link 
            href="/e-services"
            className="text-mainYellow hover:underline"
          >
            Return to E-Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgWhite">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bgWhite border-b border-strokeGrey px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link 
            href="/e-services" 
            className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">back</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Page Title */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-bgDisabled/30 px-3 py-1 rounded-full mb-4">
              <span className="text-xs text-textGrey font-medium">SERVICE ID: {serviceData.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-textBlack mb-2 sm:text-3xl">
              {serviceData.title}
            </h1>
            <p className="text-textGrey text-sm sm:text-base">
              {serviceData.description}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <span className="bg-strokeGrey/20 px-3 py-1 rounded-full text-textGrey">
                {serviceData.category}
              </span>
              <span className="text-textGrey">⏱️ {serviceData.estimatedTime}</span>
            </div>
          </div>

          {/* Process Steps */}
          <section className="space-y-6">
            <div className="space-y-4">
              {serviceData.processSteps.map((step) => (
                <div
                  key={step.id}
                  className="bg-bgWhite border border-strokeGrey rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-12 h-12 bg-textBlack rounded-full flex items-center justify-center text-textWhite font-bold text-lg">
                      {step.id}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-textBlack sm:text-xl">
                        {step.title}
                      </h3>
                      <p className="text-sm text-textBlack leading-relaxed sm:text-base">
                        {step.description}
                      </p>
                      <p className="text-xs text-textGrey bg-bgDisabled/50 px-3 py-1 rounded-full inline-block">
                        {step.office}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Download Instructions */}
          <section className="bg-bgDisabled/30 rounded-3xl p-6">
            <button
              onClick={handleDownloadInstructions}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-bgWhite border border-strokeGrey rounded-2xl hover:bg-bgDisabled hover:border-strokeFocused transition-all duration-200 text-base sm:text-lg font-medium text-textBlack"
            >
              <Download className="h-5 w-5" />
              {serviceData.downloadInstructions.title}
            </button>
            <p className="text-sm text-textGrey text-center mt-3 sm:text-base">
              {serviceData.downloadInstructions.description}
            </p>
          </section>

          {/* Start Button */}
          <div className="pt-6">
            <button
              onClick={handleStart}
              className="w-full py-4 px-6 bg-mainYellow text-textBlack font-semibold rounded-2xl hover:bg-buttonPrimaryHover transition-colors duration-200 text-base sm:text-lg shadow-md hover:shadow-lg"
            >
              Start Application
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
