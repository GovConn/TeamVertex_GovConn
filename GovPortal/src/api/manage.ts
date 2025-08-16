import { api } from "@/api/index";
import type { ActivateUserResponse, Citizen, CreateServiceRequest, Service, TimeSlot, UpdateServiceRequest, DocumentType } from "@/api/interfaces";

//api3
export const serviceSlots = (
  reservation_id: number,
  reservation_date: string
) =>
  api.get(
    `/api/v1/appointments/available_slots/${reservation_id}/${reservation_date}`
  );

//api4 - Get available slots by category ID (reservation ID)
export const getAvailableSlots = (reservation_id: number) =>
  api.get<TimeSlot[]>(`/api/v1/appointments/available_slots/${reservation_id}`);

//api5 - Create a new time slot
export const createTimeSlot = (payload: {
  booking_date: string;
  end_time: string;
  max_capacity: number;
  recurrent_count: number;
  reservation_id: number;
  reserved_count: number;
  start_time: string;
  status: string;
}) => {

  return api.post<TimeSlot>("/api/v1/appointments/create_slot", payload, {
    headers: {
      "Content-Type": "application/json"
    }
  });
}

//api6 - Get a specific time slot
export const getTimeSlot = (slot_id: number) =>
  api.get<TimeSlot>(`/api/v1/appointments/slot/${slot_id}`);

//api7 - Update a time slot
export const updateTimeSlot = (slot_id: number, payload: {
  booking_date: string;
  end_time: string;
  max_capacity: number;
  reserved_count: number;
  start_time: string;
  status: string;
}) =>
  {
    api.put<TimeSlot>(`/api/v1/appointments/slot/${slot_id}`, payload, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  }

//api8 - Delete a time slot
export const deleteTimeSlot = (slot_id: number) =>
  api.delete(`/api/v1/appointments/slot/delete/${slot_id}`);


//api5
export const getCitizenByRefId = (reference_id: string) =>
  api.get<Citizen>(`/api/v1/gov/registrations/${reference_id}`);

//api6
export const activateUser = (reference_id: string) =>
{
  console.log(`Activating user with reference ID: ${reference_id}`);
  return api.get<ActivateUserResponse>(`/api/v1/gov/user/activate?reference_id=${reference_id}`); 
}

//api5 - Get services for a specific gov node
export const getServices = (govNodeId: number) =>
  api.get<Service[]>(`/api/v1/gov/services/${govNodeId}`);

//api6 - Create a new service
export const createService = (payload: CreateServiceRequest) =>
{
  console.log("Creating service with payload:", payload);
  return api.post<Service>("/api/v1/gov/services/create", payload);
}

//api7 - Update an existing service
export const updateService = (serviceId: number, payload: UpdateServiceRequest) =>
  api.put<Service>(`/api/v1/gov/services/${serviceId}`, payload);

//api8 - Delete a service
export const deleteService = (serviceId: number) =>
  api.delete(`/api/v1/gov/services/delete/${serviceId}`);

//api9 - Get all document types
export const getAllDocumentTypes = () =>
  api.get<DocumentType[]>("/api/v1/documents/all/");

//api10 - Get document type by ID
export const getDocumentTypeById = (documentId: number) =>
  api.get<DocumentType>(`/api/v1/documents/${documentId}`);