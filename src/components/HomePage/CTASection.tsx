
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export const CTASection = () => {
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    navigate('/auth?mode=signup');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
      {/* Background elements with animation */}
      <motion.div 
        animate={{ 
          rotate: 360,
          transition: { duration: 100, repeat: Infinity, ease: "linear" }
        }}
        className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
      />
      
      <motion.div 
        animate={{ 
          rotate: -360,
          transition: { duration: 120, repeat: Infinity, ease: "linear" }
        }}
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-5xl font-display font-bold mb-6"
          >
            Ready to Experience the Magic of Zimbabwe?
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-white/90 mb-10 max-w-2xl mx-auto"
          >
            Join us and embark on a journey through breathtaking landscapes and unforgettable wildlife encounters
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button
              variant="blue-gradient"
              size="2xl"
              className="shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group"
              onClick={handleAuthClick}
            >
              <span>Start Your Journey</span>
              <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              variant="outline"
              size="2xl"
              className="text-white hover:bg-white/10 border-white/40 transition-all duration-300"
              onClick={() => navigate('/destinations')}
            >
              Explore Destinations
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
