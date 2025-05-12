
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export const CTASection = () => {
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section className="py-20 bg-blue-900 text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-40 right-10 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ready to Experience the Magic of Zimbabwe?
          </h2>
          
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Join us and embark on a journey through breathtaking landscapes and unforgettable wildlife encounters
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="blue"
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6"
              onClick={handleAuthClick}
            >
              Start Your Journey
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="text-white hover:bg-white/10 border-white/40 px-8 py-6"
              onClick={() => navigate('/destinations')}
            >
              Explore Destinations
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
