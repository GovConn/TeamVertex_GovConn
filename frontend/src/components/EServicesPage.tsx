"use client";

import { ArrowLeft, FileText, Building, CreditCard, Car, Users, ScrollText } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  category: "business" | "personal" | "legal";
  estimatedTime: string;
}

export default function EServicesPageEnhanced() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const serviceCategories: ServiceCategory[] = [
    {
      id: "business-income-tax",
      title: "Business Income Tax Registration",
      description: "Register your business for income tax and obtain necessary certificates",
      path: "/e-services/business-income-tax",
      icon: Building,
      category: "business",
      estimatedTime: "15-30 minutes"
    },
    {
      id: "pension-gratuity",
      title: "Pension & Gratuity Claims",
      description: "For Government Employees",
      path: "/e-services/pension-gratuity",
      icon: Users,
      category: "personal",
      estimatedTime: "20-45 minutes"
    },
    {
      id: "starting-business",
      title: "Starting a New Business",
      description: "Complete guide and services for starting your new business venture",
      path: "/e-services/starting-business",
      icon: Building,
      category: "business",
      estimatedTime: "30-60 minutes"
    },
    {
      id: "renewing-drivers-licence",
      title: "Renewing Drivers Licence",
      description: "Renew your driving license online with required documents",
      path: "/e-services/renewing-drivers-licence",
      icon: Car,
      category: "personal",
      estimatedTime: "10-20 minutes"
    },
    {
      id: "company-registration",
      title: "Company Registration (Registrar of Companies)",
      description: "Register your company with the Registrar of Companies",
      path: "/e-services/company-registration",
      icon: FileText,
      category: "legal",
      estimatedTime: "45-90 minutes"
    },
    {
      id: "birth-marriage-death",
      title: "Birth, Marriage, and Death Certificate Requests",
      description: "Request official certificates for vital records",
      path: "/e-services/vital-records",
      icon: ScrollText,
      category: "legal",
      estimatedTime: "5-15 minutes"
    }
  ];

  const categories = [
    { id: "all", label: "All Services", count: serviceCategories.length },
    { id: "business", label: "Business", count: serviceCategories.filter(s => s.category === "business").length },
    { id: "personal", label: "Personal", count: serviceCategories.filter(s => s.category === "personal").length },
    { id: "legal", label: "Legal", count: serviceCategories.filter(s => s.category === "legal").length }
  ];

  const filteredServices = filterCategory === "all" 
    ? serviceCategories 
    : serviceCategories.filter(service => service.category === filterCategory);

  const handleServiceSelect = (service: ServiceCategory) => {
    setSelectedService(service.id);
    
    // Pass service ID through URL params for dynamic data fetching
    router.push(`/e-services/details?serviceId=${service.id}&title=${encodeURIComponent(service.title)}`);
  };

  const handleHelpMe = () => {
    router.push('/ai-officer');
  };

  return (
    <div className="min-h-screen bg-bgWhite">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bgWhite border-b border-strokeGrey px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">back</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-textBlack mb-4 sm:text-4xl lg:text-5xl">
              E-Services
            </h1>
            <p className="text-textGrey text-base sm:text-lg max-w-2xl mx-auto">
              Access digital government services from the comfort of your home
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilterCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterCategory === category.id
                      ? "bg-mainYellow text-textBlack"
                      : "bg-bgDisabled text-textGrey hover:bg-strokeGrey/20"
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Service Categories Grid */}
          <div className="space-y-4 mb-12">
            {filteredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className={`w-full p-6 rounded-3xl transition-all duration-200 text-left hover:shadow-lg hover:-translate-y-1 ${
                    selectedService === service.id 
                      ? "bg-mainYellow shadow-lg scale-[1.02]" 
                      : "bg-bgDisabled hover:bg-strokeGrey/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-mainYellow rounded-2xl flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-textBlack" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-textBlack sm:text-xl">
                          {service.title}
                        </h3>
                        
                        {/* Selection indicator */}
                        {selectedService === service.id && (
                          <div className="ml-4 w-6 h-6 bg-textBlack rounded-full flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 bg-textWhite rounded-full"></div>
                          </div>
                        )}
                      </div>
                      
                      {service.description && (
                        <p className="text-sm text-textGrey leading-relaxed mb-2 sm:text-base">
                          {service.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-textGrey">
                        <span className="capitalize bg-strokeGrey/20 px-2 py-1 rounded-full">
                          {service.category}
                        </span>
                        <span>⏱️ {service.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Help Button */}
          <div className="text-center">
            <button 
              onClick={handleHelpMe}
              className="inline-flex items-center justify-center px-8 py-4 bg-mainYellow text-textBlack font-semibold rounded-full hover:bg-buttonPrimaryHover transition-colors duration-200 text-base sm:text-lg shadow-md hover:shadow-lg"
            >
              Help Me Find the Right Task
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
