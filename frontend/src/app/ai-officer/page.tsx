import { Metadata } from "next";
import AIOffficerPage from "@/components/AIOffficerPage";

export const metadata: Metadata = {
  title: "AI Officer - GovConn",
  description: "Get assistance from our AI-powered government service agent.",
};

export default function Page() {
  return <AIOffficerPage />;
}
