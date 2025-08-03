import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen dashboard-gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold dashboard-text-primary mb-4">404</h1>
        <p className="text-xl dashboard-text-secondary mb-6">Oops! Page not found</p>
        <p className="dashboard-text-muted mb-8">
          The page "{location.pathname}" doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => window.location.href = "/"} 
          className="dashboard-button-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
