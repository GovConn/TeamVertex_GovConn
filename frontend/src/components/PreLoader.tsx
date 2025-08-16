"use client";
import gsap from "gsap";
import Image from "next/image";
import React, { useEffect, useState } from "react";


const PreLoader: React.FC = () => {
  const [domLoaded, setDomLoaded] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(false);

  const loadRef = React.useRef<HTMLDivElement | null>(null);

    const animateOut = () => {
      gsap.to(loadRef.current, {
        opacity: 0,
        duration: 0.5,
      });
    };

  useEffect(() => {
    // Mark DOM loaded
    setDomLoaded(true);

    // Minimum 3 seconds timer
    const timer = setTimeout(() => {
      setMinTimePassed(true);
        animateOut();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show preloader until DOM is loaded AND 3 seconds passed
  if (!domLoaded || !minTimePassed) {
    return (
      <div ref={loadRef} className="fixed inset-0 bg-white flex items-center justify-center w-full h-dvh z-90">
        <div className="flex items-center justify-center container">
          <Image
            src="/images/Comp 1.gif"
            alt="Loading..."
            width={800} // set to your image's actual width
            height={600} // set to your image's actual height
            className="object-contain"
            priority
            />
        </div>
      </div>
    );
  }

  return null;
};

export default PreLoader;
