
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section className="py-16 bg-blue-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to Experience the Magic of Zimbabwe?
          </h2>
          
          <p className="text-lg text-white/90 mb-10 max-w-3xl mx-auto">
            Join us and embark on a journey through breathtaking landscapes and unforgettable wildlife encounters
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="blue"
              className="text-white px-6"
              onClick={handleAuthClick}
            >
              Start Your Journey
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              className="text-white hover:bg-white/10 border-white/30"
              onClick={() => navigate('/destinations')}
            >
              Explore Destinations
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
