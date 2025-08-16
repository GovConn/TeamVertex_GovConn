import { Metadata } from "next";
import EServicesPage from "@/components/EServicesPage";

export const metadata: Metadata = {
  title: "E-Services - GovConn",
  description: "Access digital government services including business registration, tax services, licenses, and vital records.",
};

export default function Page() {
  return <EServicesPage />;
}
