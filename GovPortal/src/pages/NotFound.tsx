import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <img src="/logo.png" alt="Logo" className="h-16 max-[425px]:h-8" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            Page not found - 404
          </CardTitle>
          <Button
            variant="government"
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            Return to Home Page
          </Button>
        </CardHeader>
      </div>
    </div>
  );
};

export default NotFound;
