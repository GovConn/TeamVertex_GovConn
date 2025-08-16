"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmationRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Redirect to the booking page since confirmation is now a modal
    const params = new URLSearchParams();
    
    // Get all search parameters
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    
    const queryString = params.toString();
    const redirectPath = `/appointments/booking${queryString ? `?${queryString}` : ''}`;
    
    router.replace(redirectPath);
  }, [router, searchParams]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-bgWhite flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-textGrey">Redirecting to appointment booking...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bgWhite flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-mainYellow border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-textGrey">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmationRedirect />
    </Suspense>
  );
}
