// "use client";
// import { Button } from "@/components/ui/button";
// import { ArrowLeftCircleIcon } from "lucide-react";
// import React, { useState } from "react";
// import StatusComponent from "@/components/StatusComponent";

// // Correct interface for Next.js 15 App Router
// interface PageProps {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// }

// export default async function Page({ searchParams }: PageProps) {
//   const [isRated, setisRated] = useState(true);
  
//   // Await the searchParams promise
//   const resolvedSearchParams = await searchParams;
//   const currentStatus = (resolvedSearchParams?.status as string) || "rejected";

//   return (
//     <div className="w-full min-h-dvh px-2 md:px-48">
//       <section className="container mx-auto p-4 w-full md:max-w-3xl flex flex-col items-center justify-center gap-4 bg-white">
//         <div className="w-full ">
//           <Button className="w-fit px-2 pr-4" variant="ghost" size="icon">
//             <ArrowLeftCircleIcon size={32} className="!w-6 !h-6" />
//             Back
//           </Button>
//         </div>

//         <div className="w-full md:max-w-xl flex flex-col">
//           <StatusComponent status={currentStatus} isRated={isRated} />
//         </div>

//         <div className="w-full md:max-w-xl pt-4 flex flex-col gap-4">
//           <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-4 flex flex-col gap-4">
//             <div>
//               <p className="text-sm text-gray-600">Selected local office</p>
//               <p className="font-medium">Divisional Secretariat - Kaduwela</p>
//             </div>

//             <div>
//               <p className="text-sm text-gray-600">Purpose</p>
//               <p className="font-medium">
//                 Requesting copies of birth certificates
//               </p>
//             </div>

//             <div>
//               <p className="text-sm text-gray-600">Appointment Date</p>
//               <p className="font-medium">2025 - August - 25</p>
//             </div>

//             <div>
//               <p className="text-sm text-gray-600">Time</p>
//               <p className="font-medium">9.15 AM - 9.30 AM</p>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page