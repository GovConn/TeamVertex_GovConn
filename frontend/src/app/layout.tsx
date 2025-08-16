import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PreLoader from "@/components/PreLoader";
import { UserProvider } from "@/contexts/UserContext";
import GovHeader from "@/components/GovHeader";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AppWrapper from "@/components/AppWrapper";
import { AppointmentProvider } from "@/contexts/AppointmentContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { HistoryProvider } from "@/contexts/HistoryContext";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GovConn Portal",
  description: "Citizen services portal for appointments and e‑services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
         <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col items-center w-full`}
      >
        <LanguageProvider>
   
           <NotificationProvider>
          <UserProvider>
            <HistoryProvider>
    
                 <AppointmentProvider>

                   <AppWrapper>
                     <GovHeader />
                   
                       
                    
                     {children}
                   
                   </AppWrapper>
                 </AppointmentProvider>
 </HistoryProvider>
          </UserProvider>
          </NotificationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
