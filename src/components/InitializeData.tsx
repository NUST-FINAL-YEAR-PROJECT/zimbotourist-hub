
import { useEffect, useState } from "react";
import { insertDummyAccommodations } from "@/scripts/insertDummyAccommodations";

export const InitializeData = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      if (!initialized) {
        try {
          await insertDummyAccommodations();
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
