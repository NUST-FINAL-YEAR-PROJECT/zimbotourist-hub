
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-primary to-accent text-white">
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
  );
};
