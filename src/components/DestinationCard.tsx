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
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-primary shadow-sm">
          {price}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-display font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground line-clamp-3 mb-4">{description}</p>
        <Button 
          className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-300"
          variant="outline"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
};