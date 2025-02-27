
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Travel App</h1>
        <p className="text-muted-foreground">Discover amazing destinations</p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/sign-in">Sign In</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
