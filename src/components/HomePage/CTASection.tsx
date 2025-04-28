
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

export const CTASection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleAuthClick = async () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section className="h-screen relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5')] opacity-10 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className={`${isMobile ? "text-5xl" : "text-6xl md:text-7xl"} font-bold mb-8 text-white`}>
            Ready for Your Next Adventure?
          </h2>
          <p className="text-2xl md:text-3xl text-white/90 mb-16">
            Join us and discover the beauty of Zimbabwe's landscapes and culture
          </p>
          <Button
            size="lg"
            className={`${isMobile ? "px-8 py-6" : "px-16 py-8"} bg-white hover:bg-white/90 text-primary text-xl font-bold rounded-xl shadow-2xl transition-all duration-300 group`}
            onClick={handleAuthClick}
          >
            Start Planning Today
            <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
