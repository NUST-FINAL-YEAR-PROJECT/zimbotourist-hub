import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DestinationCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  id?: string;
}

export const DestinationCard = ({ image, title, description, price }: DestinationCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg overflow-hidden shadow-lg"
    >
      <div className="relative aspect-[4/3]">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full font-semibold text-primary">
          {price}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground line-clamp-3">{description}</p>
        <Button 
          className="mt-4 w-full"
          onClick={() => navigate(`/booking/${id}`)}
        >
          Book Now
        </Button>
      </div>
    </motion.div>
  );
};