import React from 'react';

interface WatermarkProps {
  logoUrl: string;
  opacity?: number;
  size?: string;
  position?: string;
}

const Watermark: React.FC<WatermarkProps> = ({ 
  logoUrl, 
  opacity = 0.50, 
  size = '30%',
  position = 'center'
}) => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: `url(${logoUrl})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: position,
        backgroundSize: size,
        opacity: opacity,

        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    />
  );
};

export default Watermark;
