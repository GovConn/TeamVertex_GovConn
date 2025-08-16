import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Service {
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

interface ServiceState {
  services: Service[];
}

const storedServices = localStorage.getItem("services");

const initialState: ServiceState = {
  services: storedServices ? JSON.parse(storedServices) : [],
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    loadServices: (state, action: PayloadAction<Service[]>) => {
      state.services = action.payload;
      localStorage.setItem("services", JSON.stringify(action.payload));
    },
    addService: (state, action: PayloadAction<Service>) => {
      state.services.push(action.payload);
      localStorage.setItem("services", JSON.stringify(state.services));
    },
    clearServices: (state) => {
      state.services = [];
      localStorage.removeItem("services");
    },
  },
});

export const { loadServices, addService, clearServices } = serviceSlice.actions;
export default serviceSlice.reducer;
