
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section className="py-20 sm:py-24 bg-primary text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8">
            Join us and discover the beauty of Zimbabwe's landscapes and culture
          </p>
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-700 text-lg"
            onClick={handleAuthClick}
          >
            Start Planning Today
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
