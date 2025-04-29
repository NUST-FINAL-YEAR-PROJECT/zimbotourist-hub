
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SplashScreenProps {
  redirectPath: string;
  isAdmin?: boolean;
}

export const SplashScreen = ({ redirectPath, isAdmin = false }: SplashScreenProps) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const duration = 1500; // 1.5 seconds for the animation
    const interval = 15; // Update every 15ms
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress += increment;
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          navigate(redirectPath);
        }, 300);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [navigate, redirectPath]);
  
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div 
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            {isAdmin ? (
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-amber-500 text-white">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-indigo-600 text-white">
                <Globe className="h-12 w-12" />
              </div>
            )}
          </motion.div>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-2xl font-bold ${isAdmin ? "text-amber-600" : "text-indigo-600"}`}
        >
          {isAdmin ? "Administrator Access Granted" : "Welcome to Zimbabwe Tourism"}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 text-muted-foreground"
        >
          {isAdmin ? "Setting up your administrator dashboard..." : "Loading your personalized experience..."}
        </motion.p>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-1 mt-6 rounded-full ${isAdmin ? "bg-amber-500" : "bg-indigo-600"}`}
          style={{ width: `${progress}%`, maxWidth: "300px", margin: "24px auto 0" }}
        />
      </motion.div>
    </div>
  );
};
