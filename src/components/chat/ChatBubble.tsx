
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  links?: { text: string; url: string }[];
  image?: string | null;
}

export const ChatBubble = ({ role, content, isLoading, links, image }: ChatBubbleProps) => {
  const navigate = useNavigate();

  const handleLinkClick = (url: string) => {
    navigate(url);
  };

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          role === 'user'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
        }`}
      >
        <div className="space-y-2">
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg overflow-hidden mb-2"
            >
              <img 
                src={image} 
                alt="Travel destination" 
                className="w-full h-auto object-cover"
              />
            </motion.div>
          )}
          
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
          
          <AnimatePresence>
            {links && links.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 space-y-1"
              >
                {links.map((link, index) => (
                  <motion.button
                    key={index}
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleLinkClick(link.url)}
                    className="flex items-center text-sm text-primary hover:underline w-full text-left"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {link.text}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
