import { Metadata } from "next";
import AppointmentsPage from "@/components/AppointmentsPage";

export const metadata: Metadata = {
  title: "Appointments - GovConn",
  description: "Book appointments for government services including hospital, municipal, examination, and passport services.",
};

export default function Page() {
  return <AppointmentsPage />;
}
