"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

export default function Page() {
  const { user, referenceId } = useUser();
  const router = useRouter();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const pageRef = useRef<HTMLDivElement>(null);

  // Redirect if no user data
  useEffect(() => {
    if (!user || !referenceId) {
      router.push("/signup");
      return;
    }

    // Generate QR code with reference ID and user info
    const generateQRCode = async () => {
      try {
        const qrData = JSON.stringify({
          reference_id: user.reference_id,
          nic: user.nic,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone,
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [user, referenceId, router]);

  const handleDownloadReceipt = () => {
    if (pageRef.current) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const pageContent = pageRef.current.innerHTML;
        
        printWindow.document.write(`
          <html>
            <head>
              <title>Registration Receipt</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  text-align: center;
                }
                .receipt-container {
                  max-width: 400px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 2px solid #000;
                  border-radius: 10px;
                }
                .success-title {
                  font-size: 32px;
                  font-weight: bold;
                  margin: 20px 0;
                }
                .instructions {
                  text-align: left;
                  margin: 20px 0;
                }
                .instructions li {
                  margin: 8px 0;
                }
                .reference-number {
                  font-weight: bold;
                  font-size: 18px;
                  letter-spacing: 2px;
                  margin: 10px 0;
                }
                .qr-code {
                  margin: 20px 0;
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${pageContent}
              </div>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  if (!user || !referenceId) {
    return (
      <section className="flex flex-col items-center justify-center min-h-dvh bg-white">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-dvh bg-white px-4 py-8">
      <div 
        ref={pageRef}
        className="w-full max-w-md mx-auto flex flex-col items-center gap-6 text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mt-8 mb-4 text-green-600">Success!</h2>
        
        <ol className="text-left text-sm sm:text-base mb-4 space-y-3 px-4">
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-600">1.</span>
            <span>Download or take a screen shot of <b>this page.</b></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-600">2.</span>
            <span>Go to your nearest <b>Municipal council.</b></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-600">3.</span>
            <span><b>Provide</b> them the image and receive the login password.</span>
          </li>
        </ol>

        {/* QR Code */}
        <div className="flex flex-col items-center mt-4 mb-4 p-4 border-2 border-gray-300 rounded-lg bg-white">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Registration QR Code"
              width={200}
              height={200}
              className="mx-auto"
            />
          ) : (
            <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center rounded">
              <span className="text-gray-500">Loading QR...</span>
            </div>
          )}
        </div>

        {/* Reference Number */}
        <div className="mt-4 mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="font-semibold text-sm text-gray-700 mb-2">Reference Number</div>
          <div className="font-bold tracking-widest text-lg sm:text-xl text-blue-600">
            {referenceId}
          </div>
        </div>

        {/* User Information Display */}
        <div className="text-left text-sm bg-blue-50 p-4 rounded-lg border w-full">
          <div className="font-semibold text-blue-800 mb-2">Registration Details:</div>
          <div><strong>Name:</strong> {user.first_name} {user.last_name}</div>
          <div><strong>NIC:</strong> {user.nic}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Phone:</strong> {user.phone}</div>
        </div>

        {/* Download Receipt Button */}
        <Button
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3"
          onClick={handleDownloadReceipt}
        >
          Download Receipt
        </Button>

        {/* Go to Login Button */}
        <Link href="/login" className="w-full">
          <Button className="w-full py-3" variant="secondary">
            Go to Login
          </Button>
        </Link>
      </div>
    </section>
  );
}
