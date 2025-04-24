
import { useEffect, useState } from "react";

export const InitializeData = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!initialized) {
        try {
          // Add any initialization logic here if needed in the future
          setInitialized(true);
        } catch (error) {
          console.error("Error initializing data:", error);
        }
      }
    };

    initialize();
  }, [initialized]);

  return null; // This component doesn't render anything
};
