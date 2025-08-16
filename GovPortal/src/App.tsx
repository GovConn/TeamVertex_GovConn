import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store';
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Appointments } from "./pages/services/Appointments";
import { AppointmentDetails } from "./pages/services/AppointmentDetails";
import { Documents } from "./pages/services/Documents";
import { DocumentDetails } from "./pages/services/DocumentDetails";
import { AppointmentSettings } from "./pages/manage/AppointmentSettings";
import { ServiceSettings } from "./pages/manage/ServiceSettings";
import { AddUser } from "./pages/manage/AddUser";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services/appointments" element={<Appointments />} />
              <Route path="/services/appointments/:serviceId/:timeSlot" element={<AppointmentDetails />} />
              <Route path="/services/documents" element={<Documents />} />
              <Route path="/services/documents/:documentId" element={<DocumentDetails />} />
              <Route path="/manage/appointment-settings" element={<AppointmentSettings />} />
              <Route path="/manage/service-settings" element={<ServiceSettings />} />
              <Route path="/manage/add-user" element={<AddUser />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
