
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export const ChatWindow = ({
  isOpen,
  onClose,
  messages,
  isLoading,
  onSendMessage
}: ChatWindowProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-24 left-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-100"
    >
      <div className="p-4 border-b flex justify-between items-center bg-primary text-white">
        <h3 className="font-semibold">Zimbabwe Travel Assistant</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-white/10 text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ChatMessages messages={messages} />
      <ChatInput isLoading={isLoading} onSendMessage={onSendMessage} />
    </motion.div>
  );
};
