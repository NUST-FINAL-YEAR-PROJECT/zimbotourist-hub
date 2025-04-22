
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
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5')] opacity-10 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join us and discover the beauty of Zimbabwe's landscapes and culture
          </p>
          <Button
            size="lg"
            className="btn-gradient-accent group"
            onClick={handleAuthClick}
          >
            Start Planning Today
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
