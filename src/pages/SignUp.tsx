
import { useNavigate } from "react-router-dom";

export function SignUp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>
        <p className="text-center text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}
