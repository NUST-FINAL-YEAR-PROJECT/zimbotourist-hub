
import React from "react";
import { DestinationExplorer } from "@/components/DestinationExplorer";

export const DestinationsPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Explore Destinations</h1>
      <DestinationExplorer />
    </div>
  );
};
