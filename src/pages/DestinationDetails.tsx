
import { useParams } from "react-router-dom";

export function DestinationDetails() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Destination Details</h1>
      <p className="text-muted-foreground">Details for destination {id} will appear here.</p>
    </div>
  );
}
