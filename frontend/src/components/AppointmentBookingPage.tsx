"use client";

import { ArrowLeft, MapPin, Search, ChevronLeft, ChevronRight, Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useAppointment } from "@/contexts/AppointmentContext";
import { 
  getGovOffices, 
  getGovServices, 
  getAvailableTimeSlots, 
  getDocumentType,
  uploadBlob,
  updateCitizenDocuments,
  reserveAppointment,
  GovOffice, 
  GovService, 
  TimeSlot,
  DocumentType,
  DocumentLink
} from "@/lib/api";
import ConfirmationModal from './ConfirmationPage';
import AppointmentFinalModal from './AppointmentFinalPage';
import { useAppointmentsTranslations } from "@/hooks/useTranslations";
import { useUser } from "@/contexts/UserContext";

// Flow steps enum
enum FlowStep {
  SELECT_OFFICE = 1,
  SELECT_SERVICE = 2,
  VIEW_INSTRUCTIONS = 3,
  UPLOAD_DOCUMENTS = 4,
  SELECT_DATE_TIME = 5
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isAvailable: boolean;
}

interface UploadedDocument {
  id: number;
  name: string;
  file: File | null;
  url: string | null;
  uploading: boolean;
  uploaded: boolean;
}

// Loading component
function AppointmentBookingPageLoading() {
  return (
    <div className="min-h-screen bg-bgWhite flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-textGrey">Loading application form...</p>
      </div>
    </div>
  );
}

export default function AppointmentBookingPageWrapper() {
  return (
    <Suspense fallback={<AppointmentBookingPageLoading />}>
      <AppointmentBookingPage />
    </Suspense>
  );
}

// Instruction Step Component
interface InstructionStepProps {
  instruction: string;
  index: number;
}

const InstructionStep: React.FC<InstructionStepProps> = ({ instruction, index }) => (
  <div className="flex gap-4 p-4 bg-bgDisabled/50 rounded-2xl">
    <div className="flex-shrink-0 w-8 h-8 bg-mainYellow rounded-full flex items-center justify-center text-textBlack font-bold text-sm">
      {index + 1}
    </div>
    <p className="text-sm text-textBlack leading-relaxed sm:text-base">
      {instruction.trim()}
    </p>
  </div>
);

// Progress Step Component
interface ProgressStepProps {
  step: number;
  currentStep: FlowStep;
  title: string;
  isCompleted: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({ step, currentStep, title, isCompleted }) => {
  const isCurrent = step === currentStep;
  const isPast = step < currentStep;
  
  return (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
        isCompleted ? 'bg-green-500 text-white' :
        isCurrent ? 'bg-mainYellow text-textBlack' :
        isPast ? 'bg-strokeGrey text-textWhite' :
        'bg-strokeGrey/30 text-textGrey'
      }`}>
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        isCurrent ? 'text-textBlack' : 'text-textGrey'
      }`}>
        {title}
      </span>
    </div>
  );
};

function AppointmentBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { state, selectLocation, dispatch } = useAppointment();
  const t = useAppointmentsTranslations();
  const { user, isAuthenticated, isLoading: userLoading } = useUser();

  // Current flow step
  const [currentStep, setCurrentStep] = useState<FlowStep>(FlowStep.SELECT_OFFICE);
  
  // Get service from URL params or context
  const selectedService = state.currentBooking.service;
  
  // Form states
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [officeSearch, setOfficeSearch] = useState<string>("");
  const [serviceSearch, setServiceSearch] = useState<string>("");
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);

  // Document-related states
  const [requiredDocuments, setRequiredDocuments] = useState<DocumentType[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  // API data states
  const [govOffices, setGovOffices] = useState<GovOffice[]>([]);
  const [govServices, setGovServices] = useState<GovService[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, userLoading, router]);

  // Load government offices on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadGovOffices();
    }
  }, [selectedService, isAuthenticated]);

  // Load services when office is selected
  useEffect(() => {
    if (selectedOfficeId) {
      loadGovServices(selectedOfficeId);
      setCurrentStep(FlowStep.SELECT_SERVICE);
    } else {
      setGovServices([]);
      setSelectedServiceId(null);
      setRequiredDocuments([]);
      setUploadedDocuments([]);
      if (currentStep > FlowStep.SELECT_OFFICE) {
        setCurrentStep(FlowStep.SELECT_OFFICE);
      }
    }
  }, [selectedOfficeId]);

  // Load required documents when service is selected
  useEffect(() => {
    if (selectedServiceId) {
      const selectedGovService = govServices.find(service => service.service_id === selectedServiceId);
      if (selectedGovService?.required_document_types) {
        loadRequiredDocuments(selectedGovService.required_document_types);
        setCurrentStep(FlowStep.VIEW_INSTRUCTIONS);
      } else {
        // No documents required, skip to date/time selection
        setCurrentStep(FlowStep.SELECT_DATE_TIME);
      }
    } else {
      setRequiredDocuments([]);
      setUploadedDocuments([]);
      if (currentStep > FlowStep.SELECT_SERVICE) {
        setCurrentStep(FlowStep.SELECT_SERVICE);
      }
    }
  }, [selectedServiceId, govServices]);

  // Update step when documents are uploaded
  useEffect(() => {
    if (requiredDocuments.length > 0) {
      const allUploaded = uploadedDocuments.length > 0 && uploadedDocuments.every(doc => doc.uploaded);
      if (allUploaded && currentStep === FlowStep.UPLOAD_DOCUMENTS) {
        setCurrentStep(FlowStep.SELECT_DATE_TIME);
      }
    }
  }, [uploadedDocuments, requiredDocuments, currentStep]);

  // Load time slots when date and service are selected
  useEffect(() => {
    if (selectedOfficeId && selectedServiceId && selectedDate) {
      loadTimeSlots(selectedServiceId, selectedDate);
    } else {
      setTimeSlots([]);
      setSelectedTimeSlot(null);
    }
  }, [selectedOfficeId, selectedServiceId, selectedDate]);

  const loadGovOffices = async () => {
    try {
      setIsLoadingOffices(true);
      setError(null);
      
      const categoryId = selectedService?.category?.id;
      const offices = await getGovOffices(categoryId);
      
      setGovOffices(offices);
      dispatch({ type: 'SET_AVAILABLE_LOCATIONS', payload: offices.map(office => ({
        id: office.id.toString(),
        name: getLocalizedText(office, 'name'),
        address: office.location,
        district: office.location,
        province: office.location,
        contactNumber: office.email,
      }))});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offices');
      console.error('Failed to load government offices:', err);
    } finally {
      setIsLoadingOffices(false);
    }
  };

  const loadGovServices = async (govNodeId: number) => {
    try {
      setIsLoadingServices(true);
      setError(null);
      const services = await getGovServices(govNodeId);
      setGovServices(services.filter(service => service.is_active));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
      console.error('Failed to load government services:', err);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadRequiredDocuments = async (documentTypeIds: number[]) => {
    try {
      setIsLoadingDocuments(true);
      setDocumentError(null);
      
      const documents = await Promise.all(
        documentTypeIds.map(id => getDocumentType(id))
      );
      
      setRequiredDocuments(documents);
      setUploadedDocuments(documents.map(doc => ({
        id: doc.id,
        name: getLocalizedText(doc, 'name'),
        file: null,
        url: null,
        uploading: false,
        uploaded: false,
      })));
      
      // Move to upload documents step
      setCurrentStep(FlowStep.UPLOAD_DOCUMENTS);
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'Failed to load required documents');
      console.error('Failed to load required documents:', err);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadTimeSlots = async (serviceId: number, date: Date) => {
    try {
      setIsLoadingTimeSlots(true);
      setError(null);
      const dateString = formatDateToLocal(date);
      const slots = await getAvailableTimeSlots(serviceId, dateString);
      setTimeSlots(slots);
      dispatch({ type: 'SET_AVAILABLE_TIME_SLOTS', payload: slots.map(slot => ({
        date: dateString,
        time: slot.time,
        slotId: slot.id,
        duration: 30,
      }))});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
      console.error('Failed to load time slots:', err);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  // Helper function to get localized text
const getLocalizedText = (item: GovOffice | GovService | DocumentType, field: 'name' | 'description') => {
  if (!item) return '';
  
  // Handle GovService which has service_name_* fields
  if ('service_id' in item) {
    const fieldKey = `service_${field}_${language}`;
    return (item as any)[fieldKey] || (item as any)[`service_${field}_en`] || '';
  }
  
  // Handle other items with regular field naming
  const fieldKey = `${field}_${language}`;
  return (item as any)[fieldKey] || (item as any)[`${field}_en`] || '';
};


  // Document upload functions
  const handleFileSelect = (docId: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setDocumentError('File size should be less than 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setDocumentError('Only PDF, JPG, and PNG files are supported');
      return;
    }

    setUploadedDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, file, uploaded: false } : doc
    ));
    setDocumentError(null);
  };

  const handleFileUpload = async (docId: number) => {
    const doc = uploadedDocuments.find(d => d.id === docId);
    if (!doc?.file) return;

    try {
      setUploadedDocuments(prev => prev.map(d => 
        d.id === docId ? { ...d, uploading: true } : d
      ));

      const uploadResult = await uploadBlob(doc.file);
      
      setUploadedDocuments(prev => prev.map(d => 
        d.id === docId ? { 
          ...d, 
          url: uploadResult.url, 
          uploading: false, 
          uploaded: true 
        } : d
      ));
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'Failed to upload document');
      setUploadedDocuments(prev => prev.map(d => 
        d.id === docId ? { ...d, uploading: false } : d
      ));
    }
  };

  const handleRemoveDocument = (docId: number) => {
    setUploadedDocuments(prev => prev.map(doc => 
      doc.id === docId ? { 
        ...doc, 
        file: null, 
        url: null, 
        uploaded: false 
      } : doc
    ));
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  
    // Helper function to get localized text
  const getLocalizedTextP = (item: GovOffice | GovService | DocumentType, field: 'name' | 'description') => {
    const fieldKey = `${field}_${language}`;
    return (item as any)[fieldKey] || (item as any)[`${field}_en`] || '';
  };

  // Parse instructions from service description
  const getInstructionSteps = () => {
    const selectedGovService = govServices.find(service => service.service_id === selectedServiceId);
    if (!selectedGovService) return [];
    
    const description = getLocalizedTextP(selectedGovService, 'description');
    return description.split('.').filter((step: string) => step.trim().length > 0);
  };

  // Generate calendar days
  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      days.push({
        date: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString(),
        isSelected: selectedDate?.toDateString() === currentDay.toDateString(),
        isAvailable: currentDay >= today && currentDay.getMonth() === month
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentDate);
  
  // Check if current step is completed
  const isStepCompleted = (step: FlowStep): boolean => {
    switch (step) {
      case FlowStep.SELECT_OFFICE:
        return !!selectedOfficeId;
      case FlowStep.SELECT_SERVICE:
        return !!selectedServiceId;
      case FlowStep.VIEW_INSTRUCTIONS:
        return !!selectedServiceId; // Instructions are automatically viewed
      case FlowStep.UPLOAD_DOCUMENTS:
        return requiredDocuments.length === 0 || (uploadedDocuments.length > 0 && uploadedDocuments.every(doc => doc.uploaded));
      case FlowStep.SELECT_DATE_TIME:
        return !!(selectedDate && selectedTimeSlot);
      default:
        return false;
    }
  };

  // Final form validation
  const isFormValid = selectedOfficeId && selectedServiceId && 
    (requiredDocuments.length === 0 || uploadedDocuments.every(doc => doc.uploaded)) && 
    selectedDate && selectedTimeSlot;

  const handleNext = async () => {
    if (!isFormValid || !user?.nic) return;

    try {
      // First, update citizen documents if any were uploaded
      if (uploadedDocuments.length > 0 && uploadedDocuments.some(doc => doc.uploaded && doc.url)) {
        const documentLinks: DocumentLink[] = uploadedDocuments
          .filter(doc => doc.uploaded && doc.url)
          .map(doc => ({
            title: doc.name,
            uploaded_at: new Date().toISOString(),
            url: doc.url!
          }));

        await updateCitizenDocuments(user.nic, documentLinks);
      }

      // Update context with selected location and time slot
      const selectedOffice = govOffices.find(office => office.id === selectedOfficeId);
      const selectedGovService = govServices.find(service => service.service_id === selectedServiceId);
      const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlot);

      if (selectedOffice) {
        selectLocation({
          id: selectedOffice.id.toString(),
          name: getLocalizedText(selectedOffice, 'name'),
          address: selectedOffice.location,
          district: selectedOffice.location,
          province: selectedOffice.location,
          contactNumber: selectedOffice.email,
        });
      }

      if (selectedSlot && selectedDate) {
        dispatch({ 
          type: 'SELECT_TIME_SLOT', 
          payload: {
            date: selectedDate.toISOString().split('T')[0],
            time: selectedSlot.time,
            slotId: selectedSlot.id,
            duration: 30,
          }
        });
      }

      setShowConfirmationModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process appointment');
    }
  };

  // Calendar navigation functions
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isAvailable && day.isCurrentMonth) {
      const newSelectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day.date
      );
      setSelectedDate(newSelectedDate);
      setSelectedTimeSlot(null);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.office-dropdown')) {
        setShowOfficeDropdown(false);
      }
      if (!target.closest('.service-dropdown')) {
        setShowServiceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getServiceTitle = () => {
    return selectedService?.title || "Government Services";
  };

  // Show loading if user is loading
  if (userLoading) {
    return <AppointmentBookingPageLoading />;
  }

  // Show login redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bgWhite flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-textGrey">Please log in to continue with your appointment booking.</p>
          <Link href="/login" className="bg-mainYellow text-textBlack px-6 py-3 rounded-2xl font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgWhite">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bgWhite border-b border-mainYellow px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link 
            href="/appointments" 
            className="inline-flex items-center gap-2 text-textGrey hover:text-textBlack transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t('backButton')}</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-textGrey">
            <div className="w-2 h-2 rounded-full bg-textBlack"></div>
            <span>{t('step')} 2</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-textBlack mb-2 sm:text-3xl">
              {getServiceTitle()} {t('appointment')}
            </h1>
            <p className="text-textGrey text-sm sm:text-base">
              {t('completeSections')}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
            <ProgressStep 
              step={1} 
              currentStep={currentStep} 
              title="Select Office" 
              isCompleted={isStepCompleted(FlowStep.SELECT_OFFICE)} 
            />
            <ProgressStep 
              step={2} 
              currentStep={currentStep} 
              title="Select Service" 
              isCompleted={isStepCompleted(FlowStep.SELECT_SERVICE)} 
            />
            <ProgressStep 
              step={3} 
              currentStep={currentStep} 
              title="Instructions" 
              isCompleted={isStepCompleted(FlowStep.VIEW_INSTRUCTIONS)} 
            />
            {requiredDocuments.length > 0 && (
              <ProgressStep 
                step={4} 
                currentStep={currentStep} 
                title="Documents" 
                isCompleted={isStepCompleted(FlowStep.UPLOAD_DOCUMENTS)} 
              />
            )}
            <ProgressStep 
              step={requiredDocuments.length > 0 ? 5 : 4} 
              currentStep={currentStep} 
              title="Date & Time" 
              isCompleted={isStepCompleted(FlowStep.SELECT_DATE_TIME)} 
            />
          </div>

     

          {/* Error Display */}
          {(error || documentError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>{error || documentError}</span>
              </div>
            </div>
          )}

          {/* Step 1: Office Location Selection */}
          {currentStep >= FlowStep.SELECT_OFFICE && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-mainYellow rounded-full flex items-center justify-center text-textBlack font-bold text-sm">
                  1
                </div>
                <label className="block text-base font-semibold text-textBlack sm:text-lg">
                  {t('Select Office Location')}
                </label>
                {isStepCompleted(FlowStep.SELECT_OFFICE) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <div className="relative office-dropdown">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isLoadingOffices ? "Loading offices..." : "Search and select office location"}
                    value={selectedOfficeId ? govOffices.find(l => l.id === selectedOfficeId)?.name_en || "" : officeSearch}
                    onChange={(e) => {
                      setOfficeSearch(e.target.value);
                      setSelectedOfficeId(null);
                      setShowOfficeDropdown(true);
                    }}
                    onFocus={() => setShowOfficeDropdown(true)}
                    disabled={isLoadingOffices}
                    className="w-full px-4 py-4 pr-12 rounded-2xl border border-strokeGrey bg-bgWhite text-textBlack placeholder-textGrey focus:outline-none focus:border-strokeFocused focus:ring-2 focus:ring-strokeFocused/20 text-base disabled:opacity-50"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textGrey" />
                </div>
                
                {/* Office Dropdown */}
                {showOfficeDropdown && (officeSearch || !selectedOfficeId) && !isLoadingOffices && (
                  (() => {
                    const filteredOffices = govOffices.filter(office =>
                      officeSearch
                        ? getLocalizedText(office, 'name').toLowerCase().includes(officeSearch.toLowerCase()) ||
                          office.location.toLowerCase().includes(officeSearch.toLowerCase())
                        : true
                    );
                    return (
                      <div className="absolute z-20 w-full mt-2 bg-bgWhite border border-strokeGrey rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredOffices.map((office) => (
                          <button
                            key={office.id}
                            onClick={() => {
                              setSelectedOfficeId(office.id);
                              setOfficeSearch("");
                              setShowOfficeDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-bgDisabled transition-colors border-b border-strokeGrey/30 last:border-b-0"
                          >
                            <div className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-textGrey mt-1 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-textBlack text-sm">
                                  {getLocalizedText(office, 'name')}
                                </p>
                                <p className="text-xs text-textGrey">
                                  {office.location}
                                </p>
                                <p className="text-xs text-textGrey">
                                  {getLocalizedText(office, 'description')}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {filteredOffices.length === 0 && (
                          <div className="px-4 py-3 text-center text-textGrey text-sm">
                            No offices found
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </section>
          )}

          {/* Step 2: Service Selection */}
          {currentStep >= FlowStep.SELECT_SERVICE && selectedOfficeId && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-mainYellow rounded-full flex items-center justify-center text-textBlack font-bold text-sm">
                  2
                </div>
                <label className="block text-base font-semibold text-textBlack sm:text-lg">
                  Select Your Service
                </label>
                {isStepCompleted(FlowStep.SELECT_SERVICE) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <div className="relative service-dropdown">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isLoadingServices ? "Loading services..." : "Search and select service"}
                    value={selectedServiceId ? govServices.find(p => p.service_id === selectedServiceId)?.service_name_en || "" : serviceSearch}
                    onChange={(e) => {
                      setServiceSearch(e.target.value);
                      setSelectedServiceId(null);
                      setShowServiceDropdown(true);
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    disabled={isLoadingServices}
                    className="w-full px-4 py-4 pr-12 rounded-2xl border border-strokeGrey bg-bgWhite text-textBlack placeholder-textGrey focus:outline-none focus:border-strokeFocused focus:ring-2 focus:ring-strokeFocused/20 text-base disabled:opacity-50"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-textGrey" />
                </div>
                
{/* Service Dropdown */}
{showServiceDropdown && (serviceSearch || !selectedServiceId) && !isLoadingServices && (
  (() => {
    const filteredServices = govServices.filter(service =>
      serviceSearch
        ? getLocalizedText(service, 'name').toLowerCase().includes(serviceSearch.toLowerCase()) ||
          (service.service_name_en || "").toLowerCase().includes(serviceSearch.toLowerCase())
        : true
    );
    return (
      <div className="absolute z-20 w-full mt-2 bg-bgWhite border border-strokeGrey rounded-2xl shadow-xl max-h-60 overflow-y-auto">
 {filteredServices.map((service) => (
  <button
    key={service.service_id}
    onClick={() => {
      setSelectedServiceId(service.service_id);
      setServiceSearch("");
      setShowServiceDropdown(false);
    }}
    className="w-full px-4 py-3 text-left hover:bg-bgDisabled transition-colors border-b border-strokeGrey/30 last:border-b-0"
  >
    {getLocalizedText(service, 'name')}
  </button>
))}

        {filteredServices.length === 0 && (
          <div className="px-4 py-3 text-center text-textGrey text-sm">
            No services found
          </div>
        )}
      </div>
    );
  })()
)}


              </div>
            </section>
          )}

          {/* Step 3: Instructions */}
          {currentStep >= FlowStep.VIEW_INSTRUCTIONS && selectedServiceId && getInstructionSteps().length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-mainYellow rounded-full flex items-center justify-center text-textBlack font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg font-semibold text-textBlack sm:text-xl">
                  {t('instructions')}
                </h2>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              
              <div className="space-y-4">
                {getInstructionSteps().map((instruction: string, index: number) => (
                  <InstructionStep key={index} instruction={instruction} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Step 4: Document Upload */}
          {currentStep >= FlowStep.UPLOAD_DOCUMENTS && requiredDocuments.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-mainYellow rounded-full flex items-center justify-center text-textBlack font-bold text-sm">
                  4
                </div>
                <h2 className="text-lg font-semibold text-textBlack sm:text-xl">
                  {t('requiredDocuments')}
                </h2>
                {isStepCompleted(FlowStep.UPLOAD_DOCUMENTS) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              
              <p className="text-sm text-textGrey">
                {t('documentInstructions')}
              </p>

              <div className="space-y-4">
                {isLoadingDocuments ? (
                  <div className="text-center py-8 text-textGrey">
                    <div className="w-8 h-8 border-2 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Loading documents...</p>
                  </div>
                ) : (
                  requiredDocuments.map((docType) => {
                    const uploadedDoc = uploadedDocuments.find(d => d.id === docType.id);
                    
                    return (
                      <div
                        key={docType.id}
                        className="border border-strokeGrey rounded-2xl p-6 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-textBlack text-base">
                              {getLocalizedText(docType, 'name')}
                            </h3>
                            <p className="text-sm text-textGrey mt-1">
                              {getLocalizedText(docType, 'description')}
                            </p>
                          </div>
                          
                          {uploadedDoc?.uploaded && (
                            <button
                              onClick={() => handleRemoveDocument(docType.id)}
                              className="p-2 text-strokeError hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {uploadedDoc?.uploaded ? (
                          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <FileText className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">
                              {t('uploaded')}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <label className="flex-1">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileSelect(docType.id, file);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-strokeGrey rounded-xl hover:border-mainYellow transition-colors cursor-pointer">
                                  <Upload className="h-5 w-5 text-textGrey" />
                                  <span className="text-sm text-textGrey">
                                    {uploadedDoc?.file ? t('fileSelected') : t('selectFile')}
                                  </span>
                                </div>
                              </label>
                              
                              {uploadedDoc?.file && !uploadedDoc.uploaded && (
                                <button
                                  onClick={() => handleFileUpload(docType.id)}
                                  disabled={uploadedDoc.uploading}
                                  className="px-4 py-2 bg-mainYellow text-textBlack rounded-xl hover:bg-buttonPrimaryHover transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                  {uploadedDoc.uploading ? t('uploading') : t('uploadFile')}
                                </button>
                              )}
                            </div>

                            {uploadedDoc?.file && (
                              <div className="text-xs text-textGrey">
                                <p>{uploadedDoc.file.name}</p>
                                <p>{(uploadedDoc.file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="bg-bgDisabled/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-textGrey mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-textGrey space-y-1">
                    <p>{t('documentSize')}</p>
                    <p>{t('supportedFormats')}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Step 5: Date & Time Selection */}
          {currentStep >= FlowStep.SELECT_DATE_TIME && isStepCompleted(FlowStep.UPLOAD_DOCUMENTS) && (
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-mainYellow rounded-full flex items-center justify-center text-textBlack font-bold text-sm">
                  {requiredDocuments.length > 0 ? 5 : 4}
                </div>
                <h2 className="text-lg font-semibold text-textBlack sm:text-xl">
                  Select Date & Time
                </h2>
                {isStepCompleted(FlowStep.SELECT_DATE_TIME) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-strokeGrey/30"></div>
                  <span className="text-textGrey">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-strokeError"></div>
                  <span className="text-textGrey">Filled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-mainYellow"></div>
                  <span className="text-textGrey">Your Selection</span>
                </div>
              </div>

            {/* Compact Calendar */}
<div className="bg-bgDisabled/30 rounded-2xl p-4 w-full sm:w-96 mx-auto mt-6">
  {/* Calendar Header */}
  <div className="flex items-center justify-between mb-4">
    <button
      onClick={handlePreviousMonth}
      className="p-1.5 hover:bg-bgWhite rounded-full transition-colors"
    >
      <ChevronLeft className="h-4 w-4 text-textGrey" />
    </button>
    
    <div className="flex items-center gap-2">
      <select
        value={months[currentDate.getMonth()]}
        onChange={(e) => {
          const monthIndex = months.indexOf(e.target.value);
          setCurrentDate(new Date(currentDate.getFullYear(), monthIndex));
        }}
        className="bg-transparent text-textBlack text-sm font-medium focus:outline-none"
      >
        {months.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
      
      <select
        value={currentDate.getFullYear()}
        onChange={(e) => {
          setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth()));
        }}
        className="bg-transparent text-textBlack text-sm font-medium focus:outline-none"
      >
        {[2024, 2025, 2026].map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>

    <button
      onClick={handleNextMonth}
      className="p-1.5 hover:bg-bgWhite rounded-full transition-colors"
    >
      <ChevronRight className="h-4 w-4 text-textGrey" />
    </button>
  </div>

  {/* Week Days Header */}
  <div className="grid grid-cols-7 gap-1 mb-2">
    {weekDays.map((day) => (
      <div
        key={day}
        className="text-center text-xs font-medium text-textGrey py-1"
      >
        {day.slice(0, 2)} {/* Show only first 2 letters: Su, Mo, Tu, etc. */}
      </div>
    ))}
  </div>

  {/* Calendar Grid */}
  <div className="grid grid-cols-7 gap-1">
    {calendarDays.map((day, index) => (
      <button
        key={index}
        onClick={() => handleDateSelect(day)}
        disabled={!day.isAvailable}
        className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-all duration-200 ${
          day.isSelected
            ? "bg-textBlack text-textWhite font-bold"
            : day.isToday
            ? "bg-mainYellow text-textBlack font-bold"
            : day.isAvailable && day.isCurrentMonth
            ? "hover:bg-strokeGrey/20 text-textBlack"
            : day.isCurrentMonth
            ? "text-textGrey cursor-not-allowed"
            : "text-textGrey/50 cursor-not-allowed"
        }`}
      >
        {day.date}
      </button>
    ))}
  </div>
</div>


{/* Enhanced Time Slot Selection */}
<div className="space-y-4 p-5">
  <h3 className="text-lg font-medium text-textBlack">
    {selectedDate ? `Available Time Slots for ${selectedDate.toLocaleDateString()}` : 'Select a date to view time slots'}
  </h3>
  
  {selectedDate ? (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {isLoadingTimeSlots ? (
        <div className="text-center py-8 text-textGrey">
          <div className="w-8 h-8 border-2 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading time slots...</p>
        </div>
      ) : timeSlots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
          {timeSlots.map((slot) => {
            const availableSpots = slot.available || (slot.maxCapacity - slot.reservedCount);
            const isFullyBooked = slot.status === 'full' || availableSpots === 0;
            const isFillingSoon = availableSpots <= 3 && availableSpots > 0;
            const isSelected = selectedTimeSlot === slot.id;
            
            return (
              <div key={slot.id} className="relative p-10">
                <button
                  onClick={() => !isFullyBooked && setSelectedTimeSlot(slot.id)}
                  disabled={isFullyBooked}
                  className={`relative w-full p-4 rounded-2xl transition-all duration-200 border-2  ${
                    isSelected
                      ? "bg-mainYellow border-mainYellow text-textBlack shadow-lg "
                      : isFullyBooked
                      ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60"
                      : isFillingSoon
                      ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300"
                      : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-left">
                      <div className="font-semibold text-base leading-tight">
                        {slot.time}
                      </div>
                      <div className="text-xs mt-1 opacity-80 font-medium">
                        {isFullyBooked ? 'Fully Booked' : 
                         isFillingSoon ? 'Filling Fast' : 
                         'Available'}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end text-right">
                      <div className={`text-sm font-bold leading-tight ${
                        isFullyBooked ? 'text-red-500' :
                        isFillingSoon ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {isFullyBooked ? '0' : availableSpots}
                      </div>
                      <div className="text-xs opacity-70">
                        of {slot.maxCapacity}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isFullyBooked ? 'bg-red-400' :
                        isFillingSoon ? 'bg-orange-400' :
                        'bg-green-400'
                      }`}
                      style={{ 
                        width: `${Math.min(100, ((slot.reservedCount || 0) / slot.maxCapacity) * 100)}%` 
                      }}
                    />
                  </div>
                </button>
                
                {/* Selected indicator - positioned absolutely relative to container */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-textBlack rounded-full flex items-center justify-center shadow-lg z-10">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                {/* Urgency badge - positioned absolutely relative to container */}
                {isFillingSoon && !isSelected && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md z-10">
                    {availableSpots} left
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-strokeGrey/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-strokeGrey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-textGrey font-medium">No time slots available</p>
          <p className="text-sm text-textGrey/70 mt-1">Please try selecting a different date</p>
        </div>
      )}
    </div>
  ) : (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-strokeGrey/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-strokeGrey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-textGrey font-medium">Select a date to view time slots</p>
      <p className="text-sm text-textGrey/70 mt-1">Choose your preferred date from the calendar above</p>
    </div>
  )}
</div>


{/* Time Slot Legend */}
<div className="mt-6 p-4 bg-bgDisabled/20 rounded-xl">
  <h4 className="font-medium text-textBlack mb-3 text-sm">Slot Availability Legend:</h4>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
      <span className="text-textGrey">Available (4+ spots)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
      <span className="text-textGrey">Filling Fast (1-3 spots)</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
      <span className="text-textGrey">Fully Booked</span>
    </div>
  </div>
</div>

            </section>
          )}

          {/* Confirm Button */}
          <div className="pt-8">
            <button
              onClick={handleNext}
              disabled={!isFormValid}
              className={`w-full py-4 px-6 font-semibold rounded-2xl text-base sm:text-lg transition-all duration-200 ${
                isFormValid
                  ? "bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover shadow-md hover:shadow-lg"
                  : "bg-bgDisabled text-textGrey cursor-not-allowed"
              }`}
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirmed={async () => {
            try {
              if (!user?.nic) throw new Error('User NIC not found');
              
              await reserveAppointment(user.nic, selectedTimeSlot!);
              
              console.log('Appointment reserved successfully');
              setShowFinalModal(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to reserve appointment');
            }
          }}
          appointmentDetails={{
            service: getServiceTitle(),
            location: govOffices.find(l => l.id === selectedOfficeId)?.name_en || "",
            purpose: govServices.find(p => p.service_id === selectedServiceId)?.service_name_en || "",
            date: selectedDate?.toLocaleDateString() || "",
            timeSlot: timeSlots.find(slot => slot.id === selectedTimeSlot)?.time || "",
            patientInfo: {
              name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
              nic: user?.nic || '',
              phone: user?.phone || ''
            }
          }}
        />
      )}

      {/* Final Success Modal */}
      <AppointmentFinalModal
        isOpen={showFinalModal}
        onClose={() => setShowFinalModal(false)}
        appointmentDetails={{
          service: getServiceTitle(),
          location: govOffices.find(l => l.id === selectedOfficeId)?.name_en || "",
          purpose: govServices.find(p => p.service_id === selectedServiceId)?.service_name_en || "",
          date: selectedDate?.toLocaleDateString() || "",
          timeSlot: timeSlots.find(slot => slot.id === selectedTimeSlot)?.time || "",
        }}
      />
    </div>
  );
}
