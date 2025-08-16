"use client";

import { ArrowLeft, Upload, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from 'react';

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  file?: File;
}

interface ApplicationFormData {
  serviceId: string;
  serviceTitle: string;
  description: string;
  requiredDocuments: RequiredDocument[];
  instructions: string[];
  officeLocation?: string;
}

// Create a loading component
function ApplicationFormLoading() {
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
export default function ApplicationFormPageWrapper() {
  return (
    <Suspense fallback={<ApplicationFormLoading />}>
      <ApplicationFormPage />
    </Suspense>
  );
}

 function ApplicationFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<ApplicationFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToComply, setAgreedToComply] = useState(false);

  const serviceId = searchParams.get('serviceId');

  // Simulate dynamic data fetching based on service ID
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!serviceId) {
        router.push('/e-services');
        return;
      }

      setIsLoading(true);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data based on service ID
        const data = await getApplicationFormData(serviceId);
        setFormData(data);
      } catch (error) {
        console.error('Error fetching application data:', error);
        router.push('/e-services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [serviceId, router]);

  // Mock data generator based on service ID
  const getApplicationFormData = async (id: string): Promise<ApplicationFormData> => {
    const applicationDataMap: Record<string, ApplicationFormData> = {
      'business-income-tax': {
        serviceId: 'business-income-tax',
        serviceTitle: 'Business Income Tax Registration',
        description: 'Upload Required Documents',
        requiredDocuments: [
          {
            id: 'business-registration',
            name: 'Business registration certificate.',
            description: 'Official business registration document from Registrar of Companies',
            required: true,
            uploaded: false
          },
          {
            id: 'nic-copies',
            name: 'NIC copies of owner/directors',
            description: 'National Identity Card copies of all business owners and directors',
            required: true,
            uploaded: false
          },
          {
            id: 'bank-statement',
            name: 'Bank account statement.',
            description: 'Recent bank statement showing business account details',
            required: true,
            uploaded: false
          },
          {
            id: 'payment-receipt',
            name: 'Payment receipt (bank or online)',
            description: 'Proof of payment for tax registration fee',
            required: true,
            uploaded: false
          }
        ],
        instructions: [
          'Ensure all documents are clear and legible',
          'File size should not exceed 5MB per document',
          'Accepted formats: PDF, JPG, PNG'
        ],
        officeLocation: 'Inland Revenue Department'
      },
      'pension-gratuity': {
        serviceId: 'pension-gratuity',
        serviceTitle: 'Pension & Gratuity Claims',
        description: 'Upload Required Documents for Pension Claims',
        requiredDocuments: [
          {
            id: 'service-record',
            name: 'Complete service record',
            description: 'Official service record from HR department',
            required: true,
            uploaded: false
          },
          {
            id: 'last-salary-slip',
            name: 'Last salary slip',
            description: 'Most recent salary slip before retirement',
            required: true,
            uploaded: false
          },
          {
            id: 'pension-application',
            name: 'Pension application form',
            description: 'Completed and signed pension application form',
            required: true,
            uploaded: false
          },
          {
            id: 'bank-details',
            name: 'Bank account details',
            description: 'Bank account information for pension payments',
            required: true,
            uploaded: false
          }
        ],
        instructions: [
          'All documents must be certified by relevant authorities',
          'Submit original documents where specified',
          'Processing time: 4-6 weeks after document verification'
        ],
        officeLocation: 'Department of Pensions'
      },
      'starting-business': {
        serviceId: 'starting-business',
        serviceTitle: 'Starting a New Business',
        description: 'Upload Business Setup Documents',
        requiredDocuments: [
          {
            id: 'business-plan',
            name: 'Business plan document',
            description: 'Comprehensive business plan with market analysis',
            required: true,
            uploaded: false
          },
          {
            id: 'identity-proof',
            name: 'Identity verification documents',
            description: 'NIC or passport copies of all partners',
            required: true,
            uploaded: false
          },
          {
            id: 'address-proof',
            name: 'Business address proof',
            description: 'Utility bill or lease agreement for business premises',
            required: true,
            uploaded: false
          },
          {
            id: 'financial-projection',
            name: 'Financial projections',
            description: '3-year financial forecast and funding plan',
            required: false,
            uploaded: false
          }
        ],
        instructions: [
          'Business plan should be detailed and realistic',
          'All financial projections must be justified',
          'Submit documents in chronological order'
        ],
        officeLocation: 'Business Development Center'
      }
    };

    return applicationDataMap[id] || applicationDataMap['business-income-tax'];
  };

  const handleFileUpload = (documentId: string, file: File) => {
    if (!formData) return;

    setFormData({
      ...formData,
      requiredDocuments: formData.requiredDocuments.map(doc =>
        doc.id === documentId
          ? { ...doc, uploaded: true, file }
          : doc
      )
    });
  };

  const handleFileRemove = (documentId: string) => {
    if (!formData) return;

    setFormData({
      ...formData,
      requiredDocuments: formData.requiredDocuments.map(doc =>
        doc.id === documentId
          ? { ...doc, uploaded: false, file: undefined }
          : doc
      )
    });
  };

  const isFormValid = formData?.requiredDocuments.every(doc => 
    !doc.required || doc.uploaded
  ) && agreedToTerms && agreedToComply;

  const handleSubmit = async () => {
    if (!isFormValid || !formData) return;

    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to pending page
      router.push(`/e-services/pending?serviceId=${formData.serviceId}&applicationId=${Date.now()}`);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bgWhite flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-textGrey">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-bgWhite flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-textBlack text-lg">Application form not available</p>
          <Link href="/e-services" className="text-mainYellow hover:underline">
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
            href={`/e-services/details?serviceId=${formData.serviceId}`}
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
            <h1 className="text-2xl font-bold text-textBlack mb-2 sm:text-3xl">
              {formData.serviceTitle}
            </h1>
          </div>

          {/* Upload Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-mainYellow rounded-full flex items-center justify-center text-textBlack font-bold text-xl">
                1
              </div>
              <div>
                <h2 className="text-lg font-semibold text-textBlack sm:text-xl">
                  Submit Information
                </h2>
                <p className="text-sm text-textGrey">
                  You need to provide required information and valid documents.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {formData.requiredDocuments.map((document) => (
                <DocumentUploadField
                  key={document.id}
                  document={document}
                  onUpload={(file) => handleFileUpload(document.id, file)}
                  onRemove={() => handleFileRemove(document.id)}
                />
              ))}
            </div>

            {/* Office Location Button */}
            {formData.officeLocation && (
              <div className="bg-bgDisabled/30 rounded-2xl p-4">
                <button className="w-full py-3 bg-bgDisabled/50 text-textBlack font-medium rounded-xl hover:bg-strokeGrey/20 transition-colors">
                  Select Office Locations
                </button>
              </div>
            )}
          </section>

          {/* Agreement Checkboxes */}
          <section className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-mainYellow bg-bgWhite border-strokeGrey rounded focus:ring-mainYellow focus:ring-2"
              />
              <label htmlFor="terms" className="text-sm text-textBlack leading-relaxed">
                I here by confirm all documents are valid
              </label>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="comply"
                checked={agreedToComply}
                onChange={(e) => setAgreedToComply(e.target.checked)}
                className="mt-1 w-4 h-4 text-mainYellow bg-bgWhite border-strokeGrey rounded focus:ring-mainYellow focus:ring-2"
              />
              <label htmlFor="comply" className="text-sm text-textBlack leading-relaxed">
                I here by confirm that I will comply and provide any missing details to finish this process if needed in the future.
              </label>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-4 px-6 font-semibold rounded-2xl text-base sm:text-lg transition-all duration-200 ${
                isFormValid && !isSubmitting
                  ? "bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover shadow-md hover:shadow-lg"
                  : "bg-bgDisabled text-textGrey cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-textGrey border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Document Upload Field Component
interface DocumentUploadFieldProps {
  document: RequiredDocument;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function DocumentUploadField({ document, onUpload, onRemove }: DocumentUploadFieldProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="border border-strokeGrey rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            checked={document.uploaded}
            readOnly
            className="w-4 h-4 text-mainYellow bg-bgWhite border-strokeGrey rounded focus:ring-mainYellow focus:ring-2"
          />
          <div className="flex-1">
            <p className="font-medium text-textBlack text-sm sm:text-base">
              {document.name}
            </p>
            {document.description && (
              <p className="text-xs text-textGrey mt-1">
                {document.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {document.uploaded ? (
            <>
              <div className="flex items-center gap-1 text-strokeSuccess">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Uploaded</span>
              </div>
              <button
                onClick={onRemove}
                className="w-8 h-8 flex items-center justify-center text-strokeError hover:bg-strokeError/10 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-8 h-8 flex items-center justify-center text-textGrey hover:bg-bgDisabled rounded-full transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
