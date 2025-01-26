import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DestinationCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  id?: string;
  onClick?: () => void;
}

export const DestinationCard = ({ 
  image, 
  title, 
  description, 
  price, 
  id,
  onClick 
}: DestinationCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (id) {
      window.open(`/destination/${id}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-primary shadow-sm">
            {price}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-display font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground line-clamp-3 mb-4 text-sm">
          {description}
        </p>
        <Button 
          className="w-full bg-white text-primary hover:bg-primary hover:text-white border border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
};