
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5')] opacity-10 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-5xl sm:text-6xl font-bold mb-8 text-white">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-2xl text-white/90 mb-12">
            Join us and discover the beauty of Zimbabwe's landscapes and culture
          </p>
          <Button
            size="lg"
            className="bg-white hover:bg-white/90 text-primary text-lg px-12 py-8 rounded-xl shadow-2xl transition-all duration-300 group"
            onClick={handleAuthClick}
          >
            Start Planning Today
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
