// contexts/AppointmentContext.tsx
"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ServiceCategory } from '@/lib/api';

// Types for the booking flow
export interface BookingPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nic: string;
  address: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface BookingTimeSlot {
  date: string;
  time: string;
  slotId: string;
  duration?: number;
}

export interface BookingLocation {
  id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  contactNumber?: string;
}

export interface BookingDocuments {
  required: string[];
  optional: string[];
  uploaded: {
    [key: string]: {
      file: File;
      name: string;
      type: string;
      size: number;
      uploadedAt: Date;
    };
  };
}

export interface SelectedService {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  requirements?: string[];
  estimatedDuration?: number;
  fee?: number;
}

export interface AppointmentBooking {
  id?: string;
  service: SelectedService | null;
  personalInfo: BookingPersonalInfo;
  timeSlot: BookingTimeSlot | null;
  location: BookingLocation | null;
  documents: BookingDocuments;
  specialRequests?: string;
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmationNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Booking flow steps
export type BookingStep = 
  | 'service-selection'
  | 'location-selection'
  | 'time-selection'
  | 'personal-info'
  | 'document-upload'
  | 'review'
  | 'payment'
  | 'confirmation';

export interface AppointmentState {
  currentBooking: AppointmentBooking;
  currentStep: BookingStep;
  completedSteps: BookingStep[];
  availableServices: ServiceCategory[];
  availableLocations: BookingLocation[];
  availableTimeSlots: BookingTimeSlot[];
  isLoading: boolean;
  error: string | null;
  validationErrors: { [key: string]: string };
}

// Action types
type AppointmentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VALIDATION_ERRORS'; payload: { [key: string]: string } }
  | { type: 'SET_AVAILABLE_SERVICES'; payload: ServiceCategory[] }
  | { type: 'SET_AVAILABLE_LOCATIONS'; payload: BookingLocation[] }
  | { type: 'SET_AVAILABLE_TIME_SLOTS'; payload: BookingTimeSlot[] }
  | { type: 'SELECT_SERVICE'; payload: SelectedService }
  | { type: 'SELECT_LOCATION'; payload: BookingLocation }
  | { type: 'SELECT_TIME_SLOT'; payload: BookingTimeSlot }
  | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<BookingPersonalInfo> }
  | { type: 'UPDATE_DOCUMENTS'; payload: Partial<BookingDocuments> }
  | { type: 'ADD_UPLOADED_DOCUMENT'; payload: { key: string; document: BookingDocuments['uploaded'][string] } }
  | { type: 'REMOVE_UPLOADED_DOCUMENT'; payload: string }
  | { type: 'SET_SPECIAL_REQUESTS'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: BookingStep }
  | { type: 'COMPLETE_STEP'; payload: BookingStep }
  | { type: 'GO_TO_STEP'; payload: BookingStep }
  | { type: 'RESET_BOOKING' }
  | { type: 'SAVE_BOOKING'; payload: Partial<AppointmentBooking> }
  | { type: 'CONFIRM_BOOKING'; payload: { id: string; confirmationNumber: string } }
  | { type: 'LOAD_SAVED_BOOKING'; payload: AppointmentBooking };

// Initial state
const initialState: AppointmentState = {
  currentBooking: {
    service: null,
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nic: '',
      address: '',
    },
    timeSlot: null,
    location: null,
    documents: {
      required: [],
      optional: [],
      uploaded: {},
    },
    status: 'draft',
  },
  currentStep: 'service-selection',
  completedSteps: [],
  availableServices: [],
  availableLocations: [],
  availableTimeSlots: [],
  isLoading: false,
  error: null,
  validationErrors: {},
};

// Reducer
function appointmentReducer(state: AppointmentState, action: AppointmentAction): AppointmentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };

    case 'SET_AVAILABLE_SERVICES':
      return { ...state, availableServices: action.payload };

    case 'SET_AVAILABLE_LOCATIONS':
      return { ...state, availableLocations: action.payload };

    case 'SET_AVAILABLE_TIME_SLOTS':
      return { ...state, availableTimeSlots: action.payload };

    case 'SELECT_SERVICE':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          service: action.payload,
          documents: {
            ...state.currentBooking.documents,
            required: action.payload.requirements || [],
          },
        },
        error: null,
      };

    case 'SELECT_LOCATION':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          location: action.payload,
        },
        error: null,
      };

    case 'SELECT_TIME_SLOT':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          timeSlot: action.payload,
        },
        error: null,
      };

    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          personalInfo: {
            ...state.currentBooking.personalInfo,
            ...action.payload,
          },
        },
      };

    case 'UPDATE_DOCUMENTS':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          documents: {
            ...state.currentBooking.documents,
            ...action.payload,
          },
        },
      };

    case 'ADD_UPLOADED_DOCUMENT':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          documents: {
            ...state.currentBooking.documents,
            uploaded: {
              ...state.currentBooking.documents.uploaded,
              [action.payload.key]: action.payload.document,
            },
          },
        },
      };

    case 'REMOVE_UPLOADED_DOCUMENT':
      const { [action.payload]: removed, ...remainingDocs } = state.currentBooking.documents.uploaded;
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          documents: {
            ...state.currentBooking.documents,
            uploaded: remainingDocs,
          },
        },
      };

    case 'SET_SPECIAL_REQUESTS':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          specialRequests: action.payload,
        },
      };

    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };

    case 'COMPLETE_STEP':
      const completedSteps = [...state.completedSteps];
      if (!completedSteps.includes(action.payload)) {
        completedSteps.push(action.payload);
      }
      return { ...state, completedSteps };

    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };

    case 'SAVE_BOOKING':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          ...action.payload,
          updatedAt: new Date(),
        },
      };

    case 'CONFIRM_BOOKING':
      return {
        ...state,
        currentBooking: {
          ...state.currentBooking,
          id: action.payload.id,
          confirmationNumber: action.payload.confirmationNumber,
          status: 'confirmed',
          updatedAt: new Date(),
        },
      };

    case 'LOAD_SAVED_BOOKING':
      return {
        ...state,
        currentBooking: action.payload,
      };

    case 'RESET_BOOKING':
      return {
        ...initialState,
        availableServices: state.availableServices, // Keep loaded services
      };

    default:
      return state;
  }
}

// Context
const AppointmentContext = createContext<{
  state: AppointmentState;
  dispatch: React.Dispatch<AppointmentAction>;
  // Helper functions
  selectService: (service: SelectedService) => void;
  selectLocation: (location: BookingLocation) => void;
  selectTimeSlot: (timeSlot: BookingTimeSlot) => void;
  updatePersonalInfo: (info: Partial<BookingPersonalInfo>) => void;
  uploadDocument: (key: string, file: File) => void;
  removeDocument: (key: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: BookingStep) => void;
  validateCurrentStep: () => boolean;
  canProceedToNextStep: () => boolean;
  resetBooking: () => void;
  saveBooking: () => Promise<void>;
  confirmBooking: () => Promise<void>;
} | null>(null);

// Provider component
export function AppointmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appointmentReducer, initialState);

  // Load saved booking on mount (from localStorage or API)
  useEffect(() => {
    const savedBooking = localStorage.getItem('currentBooking');
    if (savedBooking) {
      try {
        const booking = JSON.parse(savedBooking);
        dispatch({ type: 'LOAD_SAVED_BOOKING', payload: booking });
      } catch (error) {
        console.error('Failed to load saved booking:', error);
      }
    }
  }, []);

  // Save booking to localStorage whenever it changes
  useEffect(() => {
    if (state.currentBooking.service) {
      localStorage.setItem('currentBooking', JSON.stringify(state.currentBooking));
    }
  }, [state.currentBooking]);

  // Helper functions
  const selectService = (service: SelectedService) => {
    dispatch({ type: 'SELECT_SERVICE', payload: service });
    dispatch({ type: 'COMPLETE_STEP', payload: 'service-selection' });
  };

  const selectLocation = (location: BookingLocation) => {
    dispatch({ type: 'SELECT_LOCATION', payload: location });
    dispatch({ type: 'COMPLETE_STEP', payload: 'location-selection' });
  };

  const selectTimeSlot = (timeSlot: BookingTimeSlot) => {
    dispatch({ type: 'SELECT_TIME_SLOT', payload: timeSlot });
    dispatch({ type: 'COMPLETE_STEP', payload: 'time-selection' });
  };

  const updatePersonalInfo = (info: Partial<BookingPersonalInfo>) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: info });
  };

  const uploadDocument = (key: string, file: File) => {
    const document = {
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
    };
    dispatch({ type: 'ADD_UPLOADED_DOCUMENT', payload: { key, document } });
  };

  const removeDocument = (key: string) => {
    dispatch({ type: 'REMOVE_UPLOADED_DOCUMENT', payload: key });
  };

  const stepOrder: BookingStep[] = [
    'service-selection',
    'location-selection',
    'time-selection',
    'personal-info',
    'document-upload',
    'review',
    'payment',
    'confirmation',
  ];

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      dispatch({ type: 'SET_CURRENT_STEP', payload: nextStep });
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      dispatch({ type: 'SET_CURRENT_STEP', payload: previousStep });
    }
  };

  const goToStep = (step: BookingStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  };

  const validateCurrentStep = (): boolean => {
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: {} });
    
    switch (state.currentStep) {
      case 'service-selection':
        return !!state.currentBooking.service;
      
      case 'location-selection':
        return !!state.currentBooking.location;
      
      case 'time-selection':
        return !!state.currentBooking.timeSlot;
      
      case 'personal-info':
        const { personalInfo } = state.currentBooking;
        const errors: { [key: string]: string } = {};
        
        if (!personalInfo.firstName) errors.firstName = 'First name is required';
        if (!personalInfo.lastName) errors.lastName = 'Last name is required';
        if (!personalInfo.email) errors.email = 'Email is required';
        if (!personalInfo.phone) errors.phone = 'Phone number is required';
        if (!personalInfo.nic) errors.nic = 'NIC is required';
        if (!personalInfo.address) errors.address = 'Address is required';
        
        if (Object.keys(errors).length > 0) {
          dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
          return false;
        }
        return true;
      
      case 'document-upload':
        const requiredDocs = state.currentBooking.documents.required;
        const uploadedDocs = Object.keys(state.currentBooking.documents.uploaded);
        return requiredDocs.every(doc => uploadedDocs.includes(doc));
      
      default:
        return true;
    }
  };

  const canProceedToNextStep = (): boolean => {
    return validateCurrentStep();
  };

  const resetBooking = () => {
    localStorage.removeItem('currentBooking');
    dispatch({ type: 'RESET_BOOKING' });
  };

  const saveBooking = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Here you would make an API call to save the booking
      // const result = await saveBookingAPI(state.currentBooking);
      
      dispatch({ type: 'SAVE_BOOKING', payload: { updatedAt: new Date() } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save booking' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const confirmBooking = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Here you would make an API call to confirm the booking
      // const result = await confirmBookingAPI(state.currentBooking);
      
      const mockId = Date.now().toString();
      const mockConfirmationNumber = `APT-${mockId.slice(-6)}`;
      
      dispatch({ 
        type: 'CONFIRM_BOOKING', 
        payload: { 
          id: mockId, 
          confirmationNumber: mockConfirmationNumber 
        } 
      });
      
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'confirmation' });
      localStorage.removeItem('currentBooking'); // Clear saved draft
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to confirm booking' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    state,
    dispatch,
    selectService,
    selectLocation,
    selectTimeSlot,
    updatePersonalInfo,
    uploadDocument,
    removeDocument,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    validateCurrentStep,
    canProceedToNextStep,
    resetBooking,
    saveBooking,
    confirmBooking,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
}

// Hook to use the appointment context
export function useAppointment() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
}

// Hook for step navigation helpers
export function useAppointmentStep() {
  const { state, goToNextStep, goToPreviousStep, goToStep, canProceedToNextStep } = useAppointment();
  
  const stepOrder: BookingStep[] = [
    'service-selection',
    'location-selection', 
    'time-selection',
    'personal-info',
    'document-upload',
    'review',
    'payment',
    'confirmation',
  ];

  const currentStepIndex = stepOrder.indexOf(state.currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === stepOrder.length - 1;
  const progress = ((currentStepIndex + 1) / stepOrder.length) * 100;

  return {
    currentStep: state.currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    progress,
    canProceed: canProceedToNextStep(),
    completedSteps: state.completedSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
  };
}
