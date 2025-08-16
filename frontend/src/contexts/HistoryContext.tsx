"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

interface SlotData {
  slot_id: number;
  reservation_id: number;
  start_time: string;
  end_time: string;
  max_capacity: number;
  reserved_count: number;
  status: string;
  booking_date: string;
  recurrent_count: number;
}

interface Appointment {
  slot_id: number;
  reservation_id: number;
  start_time: string;
  end_time: string;
  booking_date: string;
  status: 'completed' | 'upcoming' | 'available' | 'cancelled';
  days_to_booking: number;
  rating?: number;
  comment?: string;
  service_name: string;
  location: string;
  reserved_count: number;
  max_capacity: number;
  slot_status: string;
}

interface HistoryContextType {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  rateAppointment: (slotId: number, rating: number, comment?: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

// Get base URL from environment
const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
  }
  return baseUrl;
};

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, authToken } = useUser();

  // Fetch user's appointment slots
  const fetchAppointmentSlots = async (nic: string): Promise<SlotData[]> => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/appointments/reserved_user/get_slots/${nic}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch slots: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  };

  // Enhanced appointment status determination with days calculation
  const determineAppointmentStatusAndDays = (bookingDate: string, startTime: string, endTime: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDateObj = new Date(bookingDate + 'T00:00:00');
    const startDateTime = new Date(bookingDate + 'T' + startTime);
    const endDateTime = new Date(bookingDate + 'T' + endTime);

    if (bookingDateObj < today || (bookingDateObj.getTime() === today.getTime() && endDateTime < now)) {
      return { status: 'completed' as const, days_to_booking: 0 };
    } else if (bookingDateObj > today) {
      const diffTime = bookingDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: 'upcoming' as const, days_to_booking: diffDays };
    } else if (startDateTime <= now && now <= endDateTime) {
      return { status: 'available' as const, days_to_booking: 0 };
    } else {
      return { status: 'available' as const, days_to_booking: 0 };
    }
  };

  // Main function to fetch all appointments
  const fetchAppointments = async (): Promise<void> => {
    if (!user?.nic || !authToken) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch all slots for the user
      const slots = await fetchAppointmentSlots(user.nic);
      
      if (!slots || slots.length === 0) {
        setAppointments([]);
        return;
      }

      // Transform slots directly into appointment format
      const transformedAppointments: Appointment[] = slots.map((slot): Appointment => {
        const { status, days_to_booking } = determineAppointmentStatusAndDays(
          slot.booking_date,
          slot.start_time,
          slot.end_time
        );

        return {
          slot_id: slot.slot_id,
          reservation_id: slot.reservation_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          booking_date: slot.booking_date,
          status,
          days_to_booking,
          rating: undefined, // Will be set when user rates
          comment: undefined,
          service_name: 'Government Service Appointment',
          location: 'Government Office',
          reserved_count: slot.reserved_count,
          max_capacity: slot.max_capacity,
          slot_status: slot.status,
        };
      });

      // Sort appointments: completed first, then by booking date (upcoming first)
      transformedAppointments.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') {
          return -1;
        } else if (a.status !== 'completed' && b.status === 'completed') {
          return 1;
        } else {
          // Sort by booking date (most recent/upcoming first)
          return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
        }
      });

      setAppointments(transformedAppointments);

    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  };

  // Rate an appointment
  const rateAppointment = async (slotId: number, rating: number, comment?: string): Promise<void> => {
    try {
      // Update local state immediately for better UX
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.slot_id === slotId 
            ? { ...appointment, rating, comment } 
            : appointment
        )
      );

      // Prepare rating request
      const ratingRequest = {
        rating,
        service_id: 1, // You'll need to determine this based on your service mapping
        service_node_id: 2, // You'll need to determine this based on your service mapping
        ...(comment && comment.trim() && { comment: comment.trim() })
      };

      // Call the rating API
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/v1/gov_service_ratings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        credentials: 'include',
        body: JSON.stringify(ratingRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit rating: ${response.status} ${response.statusText}`);
      }

      const ratingResponse = await response.json();
      console.log('Rating submitted successfully:', ratingResponse);

    } catch (err) {
      console.error('Error rating appointment:', err);
      // Revert the local state change if API call fails
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.slot_id === slotId 
            ? { ...appointment, rating: undefined, comment: undefined } 
            : appointment
        )
      );
      throw err;
    }
  };

  // Refresh history
  const refreshHistory = async (): Promise<void> => {
    await fetchAppointments();
  };

  // Fetch appointments when user changes or component mounts
  useEffect(() => {
    if (user?.nic && authToken) {
      fetchAppointments();
    }
  }, [user?.nic, authToken]);

  return (
    <HistoryContext.Provider value={{
      appointments,
      isLoading,
      error,
      fetchAppointments,
      rateAppointment,
      refreshHistory,
    }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
