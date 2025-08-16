import { api } from "@/api/index";
import type {
  LoginRequest,
  LoginResponse,
  Citizen,
  ReservedUser,
  ActivateUserResponse,
  MostReservedSlotItem,
  PercentageChangeResponse,
  TodayCountResponse,
  OverallSatisfactionItem,

} from "@/api/interfaces";

//api 1
export const loginGov = (payload: LoginRequest) =>
  api.post<LoginResponse>(
    "/api/v1/gov/login",
    new URLSearchParams({
      grant_type: "password",
      username: payload.username,
      password: payload.password,
    })
  );

//api 2
export const getGovServices = (officeID: number) =>
  api.get(`/api/v1/gov/services/${officeID}`);

//api3
export const serviceSlots = (
  reservation_id: number,
  reservation_date: string
) =>
  api.get(
    `/api/v1/appointments/available_slots/${reservation_id}/${reservation_date}`
  );

//api4
export const getReservedUsers = (slot_id: string | number) =>
  api.get<ReservedUser[]>(
    `/api/v1/appointments/reserved_user/get_users/${slot_id}`
  );


// analytics
export const getMostReservedSlot = (service_id: number | string) =>
  api.get<MostReservedSlotItem[]>(
    `/api/v1/analytics/appointments/most_reserved_slot/${service_id}`
  );


export const getAppointmentsPercentageChange = (
  service_id: number | string
) =>
  api.get<PercentageChangeResponse>(
    `/api/v1/analytics/appointments/percentage_change/${service_id}`
  );

export const getAppointmentsTodayCount = (service_id: number | string) =>
  api.get<TodayCountResponse>(
    `/api/v1/analytics/appointments/today_count/${service_id}`
  );

export const getOverallSatisfaction = () =>
  api.get<OverallSatisfactionItem[]>(
    `/api/v1/analytics/services/overall_satisfaction/`
  );
