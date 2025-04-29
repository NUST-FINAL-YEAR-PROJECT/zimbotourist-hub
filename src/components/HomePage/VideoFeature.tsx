
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const VideoFeature = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <h4 className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Visual Journey</h4>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Experience Zimbabwe Through Our Lens
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Take a glimpse at the breathtaking landscapes and unique experiences that await you
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="aspect-[16/9] bg-gray-900">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
                onEnded={() => setIsPlaying(false)}
              >
                <source src="https://player.vimeo.com/external/370331493.sd.mp4?s=e90dcaba73c19e0e36993a5a281e5f300da9596f&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Button 
                    onClick={togglePlay} 
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white hover:bg-white/30 transition-all duration-300"
                  >
                    <Play className="h-10 w-10 text-white fill-white" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"
          >
            {[
              "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5",
              "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e",
              "https://images.unsplash.com/photo-1571406252241-db0730fb8d8d",
              "https://images.unsplash.com/photo-1570555014082-e7d420970198"
            ].map((image, index) => (
              <div key={index} className="rounded-xl overflow-hidden aspect-[4/3]">
                <img
                  src={image}
                  alt={`Zimbabwe landscape ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
