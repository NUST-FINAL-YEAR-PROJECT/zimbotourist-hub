
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section className="py-28 bg-amber-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8">
            Ready to Experience the Magic of Zimbabwe?
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Join us and embark on a journey through breathtaking landscapes, rich cultural heritage, 
            and unforgettable wildlife encounters
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              size="lg"
              className="text-lg font-medium px-10 py-7 rounded-full bg-amber-500 text-white hover:bg-amber-600 
                shadow-xl border-2 border-amber-400"
              onClick={handleAuthClick}
            >
              Start Your Journey Today
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              className="text-white hover:bg-white/10 border-white/30 px-8 py-6 rounded-full"
              onClick={() => navigate('/destinations')}
            >
              Explore All Destinations
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
