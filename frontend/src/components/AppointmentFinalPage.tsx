"use client";

import { Bell, HelpCircle, ChevronRight, X, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AppointmentStatus {
  status: "pending" | "confirmed" | "cancelled";
  appointmentId: string;
  submittedAt: Date;
  estimatedResponse: string;
}

interface AppointmentFinalModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentDetails?: {
    service: string;
    location: string;
    purpose: string;
    date: string;
    timeSlot: string;
  };
}

export default function AppointmentFinalModal({ 
  isOpen, 
  onClose,
  appointmentDetails 
}: AppointmentFinalModalProps) {
  const router = useRouter();
  const [appointmentStatus] = useState<AppointmentStatus>({
    status: "pending",
    appointmentId: `APT-${Date.now().toString().slice(-8)}`,
    submittedAt: new Date(),
    estimatedResponse: "within 24 hours"
  });

  // Simulated user data - in real app this would come from auth context
  const userData = {
    name: "Sahan",
    profileInitial: "S"
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

  const handleGoHome = () => {
    router.push('/');
    onClose();
  };

  const handleViewAppointments = () => {
    router.push('/appointments/history');
    onClose();
  };

  const handleGetHelp = () => {
    router.push('/ai-officer');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container - Expanded Width */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="bg-bgWhite rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-y-auto transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-bgWhite border-b border-strokeGrey px-8 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-textBlack sm:text-2xl">
                  Appointment Submitted
                </h1>
                <p className="text-textGrey text-sm">
                  #{appointmentStatus.appointmentId}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-bgDisabled transition-colors"
              >
                <X className="h-5 w-5 text-textGrey" />
              </button>
            </div>
          </div>

          {/* Modal Content - Grid Layout for Better Space Usage */}
          <div className="px-8 py-6">
            
            {/* Top Section - Status and Details in Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Left Column - Success Status */}
              <div className="text-center lg:text-left space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="w-16 h-16 bg-mainYellow rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-3 border-textBlack border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-textBlack">Pending!</h2>
                    <p className="text-sm text-textGrey">Processing your request</p>
                  </div>
                </div>
                
                <p className="text-sm text-textBlack leading-relaxed">
                  The appointment will be checked and confirmed by the relevant office. You'll be updated shortly about the status.
                </p>
              </div>

              {/* Right Column - Appointment Details */}
              <div className="bg-bgDisabled/30 rounded-2xl p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-textBlack">
                      Appointment Details
                    </h3>
                    <span className="text-xs text-textGrey">
                      #{appointmentStatus.appointmentId}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-textGrey">Status:</span>
                        <span className="font-medium text-mainYellow capitalize">
                          {appointmentStatus.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-textGrey">Submitted:</span>
                        <span className="font-medium text-textBlack text-xs">
                          {appointmentStatus.submittedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-textGrey">Response:</span>
                        <span className="font-medium text-textBlack text-xs">
                          {appointmentStatus.estimatedResponse}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Summary - Horizontal Layout */}
            {appointmentDetails && (
              <div className="bg-strokeSuccess/10 rounded-2xl p-4 border border-strokeSuccess/20 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-strokeSuccess" />
                  <h3 className="text-sm font-semibold text-textBlack">
                    Booking Summary
                  </h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-textGrey block">Service:</span>
                    <span className="font-medium text-textBlack">{appointmentDetails.service}</span>
                  </div>
                  <div>
                    <span className="text-textGrey block">Location:</span>
                    <span className="font-medium text-textBlack">{appointmentDetails.location}</span>
                  </div>
                  <div>
                    <span className="text-textGrey block">Purpose:</span>
                    <span className="font-medium text-textBlack">{appointmentDetails.purpose}</span>
                  </div>
                  <div>
                    <span className="text-textGrey block">Date & Time:</span>
                    <span className="font-medium text-textBlack">{appointmentDetails.date} at {appointmentDetails.timeSlot}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Section - User Dashboard and Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* User Dashboard Card - Spans 2 columns */}
              <div className="lg:col-span-2 bg-strokeGrey/5 border border-strokeGrey/20 rounded-2xl p-4">
                
                {/* User Info Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-textBlack rounded-full flex items-center justify-center text-textWhite font-bold text-sm">
                      {userData.profileInitial}
                    </div>
                    <div>
                      <p className="text-xs text-textGrey">Welcome</p>
                      <p className="font-semibold text-textBlack text-sm">
                        {userData.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 bg-textBlack rounded-full flex items-center justify-center">
                      <Bell className="h-4 w-4 text-textWhite" />
                    </button>
                    <button 
                      onClick={handleGetHelp}
                      className="w-8 h-8 bg-textBlack rounded-full flex items-center justify-center"
                    >
                      <HelpCircle className="h-4 w-4 text-textWhite" />
                    </button>
                  </div>
                </div>

                {/* Quick Actions - Horizontal Layout */}
                <div className="space-y-3">
                  <div className="bg-mainYellow rounded-xl p-1">
                    <h3 className="text-center text-textBlack font-semibold text-sm py-1">
                      Quick Actions
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button 
                      onClick={handleViewAppointments}
                      className="flex items-center justify-between bg-bgWhite border border-strokeGrey rounded-xl px-3 py-2 hover:bg-bgDisabled transition-colors"
                    >
                      <span className="font-medium text-textBlack text-sm">View Appointments</span>
                      <ChevronRight className="h-3 w-3 text-textGrey" />
                    </button>
                    
                    <button 
                      onClick={handleViewAppointments}
                      className="flex items-center justify-between bg-bgWhite border border-strokeGrey rounded-xl px-3 py-2 hover:bg-bgDisabled transition-colors"
                    >
                      <span className="font-medium text-textBlack text-sm">Appointment History</span>
                      <ChevronRight className="h-3 w-3 text-textGrey" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Single Column */}
              <div className="space-y-3">
                <button
                  onClick={handleGoHome}
                  className="w-full py-3 px-4 bg-mainYellow text-textBlack font-semibold rounded-xl hover:bg-buttonPrimaryHover transition-colors text-sm shadow-md hover:shadow-lg"
                >
                  Go to Home
                </button>
                
                <button
                  onClick={handleViewAppointments}
                  className="w-full py-3 px-4 border-2 border-strokeGrey text-textBlack font-semibold rounded-xl hover:bg-bgDisabled hover:border-strokeFocused transition-all duration-200 text-sm"
                >
                  View My Appointments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
