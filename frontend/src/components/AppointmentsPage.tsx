// app/appointments/page.tsx
"use client";

import { ArrowLeft, Building2, Users, FileText, Plane, RefreshCw, Shield, Car, GraduationCap, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAppointment } from "@/contexts/AppointmentContext";
import { getServiceCategories, ServiceCategory } from "@/lib/api";
import { useAppointmentsTranslations } from "@/hooks/useTranslations";

interface ServiceOption {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ElementType;
  color: string;
}

// Enhanced icon mapping for the actual service categories
const getServiceIcon = (categoryEn: string): React.ElementType => {
  const category = categoryEn.toLowerCase();
  
  // Map based on your actual API categories
  if (category.includes('education')) {
    return GraduationCap;
  }
  if (category.includes('health')) {
    return Heart;
  }
  if (category.includes('civil')) {
    return FileText;
  }
  if (category.includes('security')) {
    return Shield;
  }
  if (category.includes('transport')) {
    return Car;
  }
  
  // Fallback mappings for other potential categories
  if (category.includes('hospital') || category.includes('medical')) {
    return Heart;
  }
  if (category.includes('municipal') || category.includes('council')) {
    return Users;
  }
  if (category.includes('exam') || category.includes('certificate')) {
    return GraduationCap;
  }
  if (category.includes('passport') || category.includes('immigration')) {
    return Plane;
  }
  
  return Building2; // Default icon
};

// Color mapping for different service types
const getServiceColor = (categoryEn: string): string => {
  const category = categoryEn.toLowerCase();
  
  if (category.includes('education')) return "bg-blue-200";
  if (category.includes('health')) return "bg-red-200";
  if (category.includes('civil')) return "bg-green-200";
  if (category.includes('security')) return "bg-purple-200";
  if (category.includes('transport')) return "bg-orange-200";
  
  return "bg-mainYellow"; // Default color
};

export default function AppointmentsPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [apiServices, setApiServices] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { language } = useLanguage();
  const t = useAppointmentsTranslations();
  const { selectService, state, dispatch } = useAppointment();

  // Load services from API
  const loadServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const services = await getServiceCategories();
      setApiServices(services);
      dispatch({ type: 'SET_AVAILABLE_SERVICES', payload: services });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load services';
      setError(errorMessage);
      console.error('Failed to load services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [dispatch]);

  // Transform API services to match component interface
  const transformedServices: ServiceOption[] = apiServices.map((service) => {
    // Get the appropriate language fields
    const titleKey = `category_${language}` as keyof ServiceCategory;
    const descKey = `description_${language}` as keyof ServiceCategory;
    
    return {
      id: service.id.toString(),
      title: (service[titleKey] as string) || service.category_en,
      description: (service[descKey] as string) || service.description_en,
      detailedDescription: (service[descKey] as string) || service.description_en,
      icon: getServiceIcon(service.category_en),
      color: getServiceColor(service.category_en)
    };
  });

  // Fallback services (in case API fails completely)
  const fallbackServices: ServiceOption[] = [
    {
      id: "education",
      title: t('educationTitle') || "Education Services",
      description: t('educationDesc') || "Services related to education and learning institutions",
      detailedDescription: t('educationDetailed') || "Access educational services, examination bookings, certificate verification, and academic documentation through government education departments.",
      icon: GraduationCap,
      color: "bg-blue-200"
    },
    {
      id: "health",
      title: t('healthTitle') || "Health Services",
      description: t('healthDesc') || "Services related to healthcare and medical facilities",
      detailedDescription: t('healthDetailed') || "Book medical appointments, access healthcare services, and manage health-related documentation at government medical facilities.",
      icon: Heart,
      color: "bg-red-200"
    },
    {
      id: "civil",
      title: t('civilTitle') || "Civil Services",
      description: t('civilDesc') || "Essential citizen documentation and administration services",
      detailedDescription: t('civilDetailed') || "Access essential civil services including birth certificates, marriage certificates, and other vital documentation through government offices.",
      icon: FileText,
      color: "bg-green-200"
    },
    {
      id: "security",
      title: t('securityTitle') || "Security Services",
      description: t('securityDesc') || "Public safety and security services including police services",
      detailedDescription: t('securityDetailed') || "Access security-related services including police verification, clearance certificates, and public safety services.",
      icon: Shield,
      color: "bg-purple-200"
    },
    {
      id: "transport",
      title: t('transportTitle') || "Transport Services",
      description: t('transportDesc') || "Transportation services including licensing and infrastructure",
      detailedDescription: t('transportDetailed') || "Access transportation-related services including driving licenses, vehicle registration, and public transport information.",
      icon: Car,
      color: "bg-orange-200"
    }
  ];

  // Use API data if available, otherwise fallback
  const services = transformedServices.length > 0 ? transformedServices : fallbackServices;

  // Updated handleServiceSelection to navigate directly
  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const selectedServiceData = services.find(s => s.id === serviceId);
    if (selectedServiceData) {
      // Find the corresponding API service category
      const apiService = apiServices.find(s => s.id.toString() === serviceId) || 
        {
          id: parseInt(serviceId) || 0,
          category_en: selectedServiceData.title,
          category_si: selectedServiceData.title,
          category_ta: selectedServiceData.title,
          description_en: selectedServiceData.description,
          description_si: selectedServiceData.description,
          description_ta: selectedServiceData.description,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as ServiceCategory;

      // Create the selected service object for context
      const selectedService = {
        id: selectedServiceData.id,
        title: selectedServiceData.title,
        description: selectedServiceData.description,
        category: apiService,
        requirements: getServiceRequirements(selectedServiceData.id),
        estimatedDuration: getServiceDuration(selectedServiceData.id),
        fee: getServiceFee(selectedServiceData.id),
      };

      // Save to context
      selectService(selectedService);

      // Navigate to next step RIGHT AWAY
      router.push(`/appointments/booking?service=${serviceId}`);
    }
  };

  const handleHelpMe = () => {
    router.push('/ai-officer');
  };

  const handleRetry = () => {
    loadServices();
  };

  // Helper functions for service details
  const getServiceRequirements = (serviceId: string): string[] => {
    const requirementsMap: { [key: string]: string[] } = {
      'education': ['NIC Copy', 'Birth Certificate', 'Educational Certificates'],
      'health': ['NIC Copy', 'Medical Records', 'Insurance Details'],
      'civil': ['NIC Copy', 'Birth Certificate', 'Address Proof'],
      'security': ['NIC Copy', 'Police Report', 'Character Certificate'],
      'transport': ['NIC Copy', 'Driving License', 'Vehicle Registration'],
    };
    return requirementsMap[serviceId] || ['NIC Copy'];
  };

  const getServiceDuration = (serviceId: string): number => {
    const durationMap: { [key: string]: number } = {
      'education': 45,
      'health': 30,
      'civil': 60,
      'security': 90,
      'transport': 30,
    };
    return durationMap[serviceId] || 60;
  };

  const getServiceFee = (serviceId: string): number => {
    const feeMap: { [key: string]: number } = {
      'education': 500,
      'health': 0,
      'civil': 1000,
      'security': 2000,
      'transport': 750,
    };
    return feeMap[serviceId] || 0;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgWhite">
        <header className="sticky top-0 z-10 bg-bgWhite border-b border-strokeGrey px-4 py-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">{t('backButton')}</span>
            </Link>
          </div>
        </header>
        
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-textBlack mx-auto mb-4"></div>
            <p className="text-textGrey">{t('loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state with fallback
  if (error && transformedServices.length === 0) {
    return (
      <div className="min-h-screen bg-bgWhite">
        <header className="sticky top-0 z-10 bg-bgWhite border-b border-strokeGrey px-4 py-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">{t('backButton')}</span>
            </Link>
          </div>
        </header>
        
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-textBlack text-textWhite rounded-full hover:bg-textBlack/80 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('retry')}
                </button>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <p className="text-yellow-800 text-sm">
                  {t('usingFallbackServices') || "Using offline service categories. Some information may be limited."}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgWhite">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bgWhite border-b border-mainYellow px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t('backButton')}</span>
          </Link>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-textGrey">
            <div className="w-2 h-2 rounded-full bg-textBlack"></div>
            <span>Step 1</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-textBlack mb-4 sm:text-4xl lg:text-5xl">
              {t('title')}
            </h1>
            <p className="text-textGrey text-base sm:text-lg max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Service Options Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8 mb-12">
            {services.map((service) => {
              const IconComponent = service.icon;
              const isSelected = selectedServiceId === service.id;
              
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelection(service.id)}
                  className={`group relative p-6 rounded-3xl transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-2 transform ${
                    isSelected 
                      ? `${service.color} shadow-xl scale-105 ring-2 ring-strokeFocused` 
                      : "bg-bgDisabled hover:bg-strokeGrey/10 hover:shadow-lg"
                  }`}
                >
                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  
                  {/* Icon container with animation */}
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-transform duration-300 ${
                    isSelected ? "scale-110" : "group-hover:scale-105"
                  } ${isSelected ? 'bg-white/50' : service.color}`}>
                    <IconComponent className="h-8 w-8 text-textBlack" />
                  </div>

                  {/* Content */}
                  <div className="relative space-y-3">
                    <h3 className="text-lg font-bold text-textBlack sm:text-xl lg:text-2xl capitalize">
                      {service.title}
                    </h3>
                    <p className="text-sm text-textGrey leading-relaxed sm:text-base opacity-90">
                      {service.description}
                    </p>
                  </div>

                  {/* Selection indicator with animation */}
                  {isSelected && (
                    <div className="absolute top-6 right-6 w-8 h-8 bg-textBlack rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-3 h-3 bg-textWhite rounded-full"></div>
                    </div>
                  )}
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-strokeFocused/30 transition-all duration-300" />
                </button>
              );
            })}
          </div>

          {/* Help Section */}
          <div className="text-center mb-8">
            <button 
              onClick={handleHelpMe}
              className="inline-flex items-center justify-center px-8 py-4 bg-strokeGrey/20 text-textBlack font-semibold rounded-full hover:bg-strokeGrey/30 transition-colors duration-200 text-base sm:text-lg shadow-md hover:shadow-lg border border-strokeGrey/30"
            >
              {t('helpMeFind')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
