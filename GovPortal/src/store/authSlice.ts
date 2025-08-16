import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: {
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
    access_token: string;
    token_type: string;
  } | null;
}

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("access_token");

const initialState: AuthState = {
  isAuthenticated: !!savedToken,
  user: savedUser
    ? { ...JSON.parse(savedUser), access_token: savedToken || "" }
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthState["user"]>) => {
      state.isAuthenticated = !!action.payload?.access_token;
      state.user = action.payload;

      // Persist to localStorage
      localStorage.setItem("access_token", action.payload?.access_token || "");
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;

      // Remove from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      localStorage.removeItem("services");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
