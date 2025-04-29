
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useState } from "react";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Adventure Enthusiast",
      content: "Zimbabwe exceeded all my expectations. The natural beauty and warm hospitality made my trip unforgettable. The guides were incredibly knowledgeable and I felt safe throughout my journey.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    {
      name: "Michael Chen",
      role: "Travel Photographer",
      content: "The diversity of wildlife and stunning landscapes provided endless photography opportunities. Victoria Falls was mind-blowing and the safari experience in Hwange National Park was world-class.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
    },
    {
      name: "Emily Davis",
      role: "Cultural Explorer",
      content: "The local guides shared incredible insights into Zimbabwe's rich history and traditions. Great Zimbabwe ruins were spectacular and the local cuisine was delicious. I can't wait to return!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h4 className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Traveler Stories</h4>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">What Our Explorers Say</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear from travelers who have experienced Zimbabwe's wonders firsthand
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center justify-center"
          >
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  src={testimonials[activeIndex].image}
                  alt={testimonials[activeIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-amber-400 rounded-full p-4">
                <Quote className="w-8 h-8 text-white" />
              </div>
              
              {/* Pagination dots */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeIndex === index ? "bg-primary w-6" : "bg-gray-300"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Card className="p-8 bg-white border-none shadow-lg relative h-full flex flex-col justify-center">
              <div className="mb-6 flex">
                {Array.from({ length: testimonials[activeIndex].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                ))}
              </div>
              
              <p className="text-xl mb-8 italic text-gray-700">"{testimonials[activeIndex].content}"</p>
              
              <div>
                <h4 className="font-bold text-xl">{testimonials[activeIndex].name}</h4>
                <p className="text-primary">{testimonials[activeIndex].role}</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
