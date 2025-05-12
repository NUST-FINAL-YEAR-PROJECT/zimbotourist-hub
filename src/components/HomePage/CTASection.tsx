
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export const CTASection = () => {
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Modern background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1608638317448-83eed67f2738')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-blue-900" />
        <motion.div 
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"], 
          }} 
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url("/grid.svg")',
            backgroundSize: '30px 30px'
          }}
        />
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,288L80,272C160,256,320,224,480,218.7C640,213,800,235,960,229.3C1120,224,1280,192,1360,176L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-5xl md:text-6xl font-display font-bold mb-8"
          >
            Ready to Experience the Magic of Zimbabwe?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto"
          >
            Join us and embark on a journey through breathtaking landscapes, rich cultural heritage, 
            and unforgettable wildlife encounters
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button
              size="lg"
              className="text-lg font-medium px-10 py-7 rounded-full bg-white text-blue-900 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              onClick={handleAuthClick}
            >
              Start Your Journey Today
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button
              variant="outline"
              className="text-white hover:bg-white/10 border-white/30 px-8 py-6 rounded-full transition-all duration-300"
              onClick={() => navigate('/destinations')}
            >
              Explore All Destinations
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
