import { Metadata } from "next";
import ProfilePage from "@/components/ProfilePage";

export const metadata: Metadata = {
  title: "Profile - GovConn",
  description: "Manage your profile, language preferences, and account settings.",
};

export default function Page() {
  return <ProfilePage />;
}
