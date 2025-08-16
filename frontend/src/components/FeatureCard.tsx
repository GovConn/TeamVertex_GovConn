import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  Icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

const FeatureCard = ({ 
  title, 
  Icon, 
  href, 
  onClick, 
  disabled = false, 
  children 
}: FeatureCardProps) => {
  const handleClick = () => {
    if (disabled) return;
    
    if (onClick) {
      onClick();
    } else if (href) {
      window.location.href = href;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group rounded-3xl border bg-card p-6 shadow-md transition-all duration-200 ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-95"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Icon Container */}
        <div className={`rounded-2xl border p-4 transition-colors duration-200 ${
          disabled
            ? "bg-gray-100 border-gray-200"
            : "bg-background border-gray-200"
        }`}>
          <Icon className={`h-9 w-9 ${
            disabled ? "text-gray-400" : "text-mainYellow"
          }`} />
        </div>
        
        {/* Title */}
        <div className={`text-center font-semibold ${
          disabled ? "text-gray-400" : "text-textBlack"
        }`}>
          {title}
        </div>
        
        {/* Status Messages */}
        {disabled && title === "Coming Soon" && (
          <p className="text-xs text-gray-500 text-center mt-1">
            This feature will be available soon
          </p>
        )}
        
        {disabled && title !== "Coming Soon" && (
          <p className="text-xs text-gray-500 text-center mt-1">
            Login required to access
          </p>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default FeatureCard;
