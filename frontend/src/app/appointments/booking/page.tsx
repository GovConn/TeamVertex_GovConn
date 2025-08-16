import { Metadata } from "next";
import { Suspense } from "react";
import AppointmentBookingPage from "@/components/AppointmentBookingPage";

export const metadata: Metadata = {
  title: "Book Appointment - GovConn",
  description: "Complete your appointment booking by selecting location, purpose, date and time.",
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-bgWhite flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-textGrey">Loading appointment booking...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppointmentBookingPage />
    </Suspense>
  );
}
