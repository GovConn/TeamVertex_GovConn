export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  name_en?: string;
  name_si?: string;
  name_ta?: string;
  role?: string;
  email?: string;
  location?: string;
  category_id?: number;
  created_at?: string;
  description_en?: string;
  description_si?: string;
  description_ta?: string;
  access_token: string;
  token_type: string;
}

export interface TimeSlot {
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
export interface DocumentLink {
  title: string;
  uploaded_at: string;
  url: string;
}

export interface Citizen {
  id: number;
  nic: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  document_links: DocumentLink[];
  active: boolean;
  role: string;
  created_at: string;
}

export interface ActivateUserResponse {
  message: string;
  role: string;
  active: boolean;
  document_links: { title: string; url: string; uploaded_at: string }[];
  created_at?: string;

}

export interface ReservedUser {
  citizen: Citizen;
  citizen_nic: string;
  reference_id: number;
  slot_id: number;
}


export interface Service {
  service_id?: number;
  created_at?: string;
  description_en: string;
  description_si: string;
  description_ta: string;
  gov_node_id: number;
  is_active: boolean;
  required_document_types: number[];
  service_name_en: string;
  service_name_si: string;
  service_name_ta: string;
  service_type: string;
  updated_at?: string;
}

export interface CreateServiceRequest {
  description_en: string;
  description_si: string;
  description_ta: string;
  gov_node_id: number;
  is_active: boolean;
  required_document_types: number[];
  service_name_en: string;
  service_name_si: string;
  service_name_ta: string;
  service_type: string;
}

export interface UpdateServiceRequest {
  description_en: string;
  description_si: string;
  description_ta: string;
  is_active: boolean;
  required_document_types: number[];
  service_name_en: string;
  service_name_si: string;
  service_name_ta: string;
  service_type: string;
}

export interface DocumentType {
  id: number;
  name_en: string;
  name_si: string;
  name_ta: string;
  description_en: string;
  description_si: string;
  description_ta: string;
}


// Analytics
export interface MostReservedSlotItem {
  booking_date: string;
  max_reserved: number;
  start_time: string;
}

export interface PercentageChangeResponse {
  percentage_change: number;
}

export interface TodayCountResponse {
  today_count: number;
}

export interface OverallSatisfactionItem {
  category_en: string;
  avg_rating: number;
}
