"use client";

import { MapPin, Calendar, Clock, User, FileText, CheckCircle2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AppointmentDetails {
  service: string;
  location: string;
  purpose: string;
  date: string;
  timeSlot: string;
  patientInfo: {
    name: string;
    nic: string;
    phone?: string;
  };
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  appointmentDetails: AppointmentDetails;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirmed,
  appointmentDetails 
}: ConfirmationModalProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsConfirming(false);
      setIsConfirmed(false);
    }
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isConfirming, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const confirmationItems = [
    {
      id: "service",
      icon: FileText,
      label: "Service Type",
      value: appointmentDetails.service,
      description: "Selected government service category"
    },
    {
      id: "location",
      icon: MapPin,
      label: "Location",
      value: appointmentDetails.location,
      description: "Service location for your appointment"
    },
    {
      id: "purpose",
      icon: CheckCircle2,
      label: "Purpose",
      value: appointmentDetails.purpose,
      description: "Specific service you're booking"
    },
    {
      id: "date",
      icon: Calendar,
      label: "Date",
      value: appointmentDetails.date,
      description: "Your selected appointment date"
    },
    {
      id: "time",
      icon: Clock,
      label: "Time",
      value: appointmentDetails.timeSlot,
      description: "Your selected time slot"
    }
  ];

  const handleConfirmAppointment = async () => {
    setIsConfirming(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsConfirming(false);
      setIsConfirmed(true);
      
      // Show final modal after confirmation
      setTimeout(() => {
        console.log('Closing confirmation modal and showing final modal');
        onClose();
        onConfirmed();
      }, 2000);
    }, 2000);
  };

  const handleEditAppointment = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={!isConfirming ? onClose : undefined}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="bg-bgWhite rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-bgWhite border-b border-strokeGrey px-6 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-textBlack sm:text-2xl">
                  Confirmation
                </h1>
                <p className="text-textGrey text-sm">
                  Please review your appointment details
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isConfirming}
                className="p-2 rounded-full hover:bg-bgDisabled transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5 text-textGrey" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-6 space-y-6">
            
            {/* Patient Information */}
            <section className="bg-bgDisabled/30 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-textBlack rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-textWhite" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-textBlack">
                    {appointmentDetails.patientInfo.name}
                  </h2>
                  <p className="text-sm text-textGrey">
                    NIC: {appointmentDetails.patientInfo.nic}
                  </p>
                  {appointmentDetails.patientInfo.phone && (
                    <p className="text-sm text-textGrey">
                      Phone: {appointmentDetails.patientInfo.phone}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Confirmation Details */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-textBlack">
                Appointment Details
              </h2>
              
              <div className="space-y-3">
                {confirmationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-strokeGrey/5 rounded-xl border border-strokeGrey/20"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-mainYellow rounded-xl flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-textBlack" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-textBlack text-sm">
                          {item.label}
                        </h3>
                        <p className="font-medium text-textBlack text-base mb-1">
                          {item.value}
                        </p>
                        <p className="text-xs text-textGrey">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Important Reminders */}
            <section className="bg-mainYellow/10 rounded-2xl p-4 border border-mainYellow/20">
              <h3 className="text-base font-semibold text-textBlack mb-3">
                Important Reminders
              </h3>
              <ul className="space-y-2 text-sm text-textBlack">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-mainYellow rounded-full mt-2 flex-shrink-0"></div>
                  <span>Arrive 15 minutes before your scheduled appointment time</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-mainYellow rounded-full mt-2 flex-shrink-0"></div>
                  <span>Bring a valid photo ID and all required documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-mainYellow rounded-full mt-2 flex-shrink-0"></div>
                  <span>You will receive a confirmation SMS with your appointment details</span>
                </li>
              </ul>
            </section>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {isConfirmed ? (
                <div className="text-center p-6 bg-strokeSuccess/10 rounded-2xl border border-strokeSuccess/20">
                  <div className="w-12 h-12 bg-strokeSuccess rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-textWhite" />
                  </div>
                  <h3 className="text-lg font-bold text-strokeSuccess mb-2">
                    Appointment Confirmed!
                  </h3>
                  <p className="text-textGrey text-sm">
                    Redirecting you to the dashboard...
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleConfirmAppointment}
                    disabled={isConfirming}
                    className={`w-full py-3 px-6 font-semibold rounded-xl text-base transition-all duration-200 ${
                      isConfirming
                        ? "bg-bgDisabled text-textGrey cursor-not-allowed"
                        : "bg-mainYellow text-textBlack hover:bg-buttonPrimaryHover shadow-md hover:shadow-lg"
                    }`}
                  >
                    {isConfirming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-textGrey border-t-transparent rounded-full animate-spin"></div>
                        <span>Confirming...</span>
                      </div>
                    ) : (
                      "Confirm Appointment"
                    )}
                  </button>
                  
                  <button
                    onClick={handleEditAppointment}
                    disabled={isConfirming}
                    className="w-full py-3 px-6 border-2 border-strokeGrey text-textBlack font-semibold rounded-xl hover:bg-bgDisabled hover:border-strokeFocused transition-all duration-200 text-base disabled:opacity-50"
                  >
                    Edit Appointment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
