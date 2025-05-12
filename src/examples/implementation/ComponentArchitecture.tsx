
import React from 'react';
import { Button } from "@/components/ui/button";

/**
 * Example of component architecture showcasing:
 * - Component structure
 * - Props typing
 * - Variant pattern using cva
 */

interface CardProps {
  title: string;
  description: string;
  image?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Card = ({ title, description, image, action }: CardProps) => {
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white dark:bg-gray-800 dark:border-gray-700">
      {image && (
        <div className="w-full aspect-[16/9] relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
        {action && (
          <Button onClick={action.onClick} variant="default">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

// Example of how the component would be used
export const ExampleUsage = () => {
  const handleAction = () => {
    console.log("Card action clicked");
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        title="Victoria Falls"
        description="Experience the majestic Victoria Falls, one of the Seven Natural Wonders of the World."
        image="/examples/victoria-falls.jpg"
        action={{
          label: "View Details",
          onClick: handleAction
        }}
      />
    </div>
  );
};
