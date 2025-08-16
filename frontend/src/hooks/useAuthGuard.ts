"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAuthGuard = () => {
  const { isAuthenticated } = useUser();
  const router = useRouter();

  const requireAuth = (callback?: () => void) => {
    if (!isAuthenticated) {
      toast.error("Please login to access this feature");
      router.push("/login");
      return false;
    }
    
    if (callback) {
      callback();
    }
    return true;
  };

  return { requireAuth, isAuthenticated };
};
