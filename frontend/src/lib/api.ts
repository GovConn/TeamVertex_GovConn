import { useUser } from '@/contexts/UserContext';

interface BlobUploadResponse {
  filename: string;
  uploaded_at: string;
  url: string;
}

interface ServiceCategory {
  id: number;
  category_en: string;
  category_si: string;
  category_ta: string;
  description_en: string;
  description_si: string;
  description_ta: string;
  created_at: string;
}


interface ApiError {
  message: string;
  status?: number;
  details?: any;
}


interface DocumentLink {
  uploaded_at: string;
  title: string;
  url: string;
}

interface RegisterDocumentLink{
  title: string;
  url: string;
}

interface RegisterRequest {
  active: boolean;
  document_links: RegisterDocumentLink[];
  email: string;
  first_name: string;
  last_name: string;
  nic: string;
  phone: string;
}

interface RegisterResponse extends RegisterRequest {
  reference_id: number;
}



// Enhanced API request with authentication
export const authenticatedRequest = async (
  url: string, 
  options: RequestInit = {},
  authToken?: string
): Promise<Response> => {
  const token = authToken || localStorage.getItem('govconn_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};



// Get the base URL from environment variables
const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined in environment variables');
  }
  return baseUrl;
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64Content = base64.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = error => reject(error);
  });
};

// Upload blob
export const uploadBlob = async (
  file: File, 
  customFilename?: string
): Promise<BlobUploadResponse> => {
  try {
    const base64Content = await fileToBase64(file);
    
    // Determine content type
    let contentType = 'image';
    if (file.type === 'application/pdf') {
      contentType = 'pdf';
    }

    const filename = customFilename || file.name.split('.')[0];
    
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/blob/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: contentType,
        file: base64Content,
        filename: filename, 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Upload blob error:', error);
    throw error;
  }
};

// Enhanced error handler that deals with auth errors
const handleApiError = async (response: Response, context: string) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth data and potentially redirect to login
      localStorage.removeItem('govconn_user');
      localStorage.removeItem('govconn_auth');
      localStorage.removeItem('govconn_token');
      localStorage.removeItem('govconn_token_expiry');
      
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (response.status === 403) {
      throw new Error('Access forbidden. You don\'t have permission to perform this action.');
    }
    
    const errorText = await response.text();
    throw new Error(`${context} failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
};

// Updated service functions
export const getServiceCategories = async (authToken?: string): Promise<ServiceCategory[]> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await authenticatedRequest(`${baseUrl}/api/v1/gov/services/`, {
      method: 'GET',
      cache: 'default' as RequestCache,
    }, authToken);

    await handleApiError(response, 'Fetch service categories');
    return response.json();
  } catch (error) {
    console.error('Get service categories error:', error);
    throw error;
  }
};


// Register citizen
export const registerCitizen = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/citizen/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Registration failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Register citizen error:', error);
    throw error;
  }
};


// lib/api.ts (add these to your existing API file)

export interface GovOffice {
  id: number;
  email: string;
  username: string;
  location: string;
  category_id: number;
  name_si: string;
  name_en: string;
  name_ta: string;
  role: string;
  description_si: string;
  description_en: string;
  description_ta: string;
  created_at: string;
}

export interface GovService {
  service_id: number;
  gov_node_id: number;
  service_type: string;
  service_name_si: string;
  service_name_en: string;
  service_name_ta: string;
  description_si: string;
  description_en: string;
  description_ta: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  required_document_types: number[];
}


export async function getGovOffices(categoryId?: number): Promise<GovOffice[]> {
   const baseUrl = getBaseUrl();
   console.log("Fetching government offices from:", baseUrl);
  try {
    const url = categoryId 
      ? `${baseUrl}/api/v1/gov/offices?category_id=${categoryId}`
      : `${baseUrl}/api/v1/gov/offices`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch government offices: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching government offices:', error);
    throw error;
  }
}

export async function getGovServices(govNodeId: number): Promise<GovService[]> {
      const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/v1/gov/services/${govNodeId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch government services: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching government services:', error);
    throw error;
  }
}

export interface TimeSlot {
  id: string;
  time: string;
  available: number;
  isBooked?: boolean;
  slotId: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  reservedCount: number;
  status: string;
  bookingDate: string;
}

// API response interface
interface ApiTimeSlot {
  booking_date: string;
  end_time: string;
  max_capacity: number;
  reservation_id: number;
  reserved_count: number;
  slot_id: number;
  start_time: string;
  status: string;
  recurrent_count: number; // Added missing property
}


export async function getAvailableTimeSlots(
  serviceId: number, 
  date: string
): Promise<TimeSlot[]> {
  const baseUrl = getBaseUrl();
  console.log(`Fetching available time slots for service ${serviceId} on ${date}`);
  
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/appointments/available_slots/${serviceId}/${date}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch time slots: ${response.statusText}`);
    }

    const apiSlots: ApiTimeSlot[] = await response.json();
    console.log('API slots received:', apiSlots);
    
    // Transform API response to match our TimeSlot interface
    const transformedSlots: TimeSlot[] = apiSlots.map((slot) => {
      // Combine booking_date with start_time and end_time to create full datetime objects
      const startDateTime = new Date(`${slot.booking_date}T${slot.start_time}`);
      const endDateTime = new Date(`${slot.booking_date}T${slot.end_time}`);
      
      // Format time display (e.g., "9:00 AM - 10:00 AM")
      const timeDisplay = `${formatTime(startDateTime)} - ${formatTime(endDateTime)}`;
      
      const available = slot.max_capacity - slot.reserved_count;
      
      return {
        id: slot.slot_id.toString(), // Use slot_id directly as string
        time: timeDisplay,
        available: available,
        isBooked: slot.status === 'booked' || available <= 0,
        slotId: slot.slot_id,
        startTime: `${slot.booking_date}T${slot.start_time}`, // Full ISO datetime string
        endTime: `${slot.booking_date}T${slot.end_time}`,     // Full ISO datetime string
        maxCapacity: slot.max_capacity,
        reservedCount: slot.reserved_count,
        status: slot.status,
        bookingDate: slot.booking_date,
        reservationId: slot.reservation_id, // Include reservation_id from API
        recurrentCount: slot.recurrent_count, // Include recurrent_count from API
      };
    });

    // Filter only available slots with capacity
    const availableSlots = transformedSlots.filter(slot => 
      slot.status === 'available' && slot.available > 0
    );
    
    console.log(`Found ${availableSlots.length} available slots out of ${transformedSlots.length} total slots`);
    return availableSlots;
    
  } catch (error) {
    console.error('Error fetching time slots:', error);
    console.warn('Returning empty array due to API error');
    return [];
  }
}

// Helper function to format time display
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}



// Optional: Add a function to get time slots with better error handling and caching
export async function getAvailableTimeSlotsWithRetry(
  serviceId: number, 
  date: string,
  maxRetries: number = 3
): Promise<TimeSlot[]> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getAvailableTimeSlots( serviceId, date);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError!;
}


// Update citizen document links
export const updateCitizenDocuments = async (nic: string, documentLinks: DocumentLink[]) => {
  console.log('Updating documents for NIC:', nic);
  console.log('Document links:', documentLinks);
  const baseUrl = getBaseUrl();
  
  const response = await fetch(`${baseUrl}/api/v1/citizen/update/document_links`, {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nic,
      document_links: documentLinks
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    console.error('API Error Response:', errorData);
    throw new Error(`Failed to update documents: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};


// Reserve appointment
export const reserveAppointment = async (citizenNic: string, slotId: string) => {
  console.log('Reserving appointment for NIC:', citizenNic, 'on slot ID:', slotId);
    const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/appointments/reserved_user`, {
    method: 'POST',
   headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
    body: JSON.stringify({
      citizen_nic: citizenNic,
      slot_id: parseInt(slotId)
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to reserve appointment: ${response.statusText}`);
  }
  
  return response.json();
};

// Get document details by ID
export const getDocumentType = async (documentId: number): Promise<DocumentType> => {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/documents/${documentId}`, {
    headers: {
      'accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch document type: ${response.statusText}`);
  }
  
  return response.json();
};

export interface DocumentType {
  id: number;
  name_en: string;
  name_si: string;
  name_ta: string;
  description_en: string;
  description_si: string;
  description_ta: string;
}

export interface DocumentUpload {
  filename: string;
  uploaded_at: string;
  url: string;
}


export interface AppointmentReservation {
  citizen_nic: string;
  slot_id: number;
}













export interface TimeSlot {
  id: string;
  time: string;
  available: number;
  isBooked?: boolean;
}


// Optional: Export types for use in components
export type {
  ServiceCategory,
  BlobUploadResponse,
  DocumentLink,
  RegisterRequest,
  RegisterResponse,
  ApiError
};