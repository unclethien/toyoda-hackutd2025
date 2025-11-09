import { useAuth0 } from "@auth0/auth0-react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export const HomePage = () => {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const navigate = useNavigate();

  // Redirect to sessions if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/sessions");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted gap-4">
        <Logo size={64} />
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Logo size={280} className="mb-4" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">TOYODA</h1>
          <h2 className="text-xl md:text-2xl font-bold"> Car‑hunting in the Jedi Way</h2>
          <p className="text-md text-muted-foreground">
            Best out-the-door prices, find them you will. <br /> Our droid calls the dealers for you.
          </p>
        </div>

        {/* Features */}
        <Card className="w-full">
          <CardContent className="pt-6 space-y-4 text-left">
            <Feature
              title="Search Any Car"
              description="Enter your desired model, type, and location"
            />
            <Feature
              title="AI Calls Dealers"
              description="Our AI contacts dealers automatically"
            />
            <Feature
              title="Compare Quotes"
              description="Get the best out-the-door prices in one place"
            />
          </CardContent>
        </Card>

        {/* CTA Button */}
        <Button
          onClick={() => loginWithRedirect()}
          size="lg"
          className="w-full text-lg"
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

interface FeatureProps {
  title: string;
  description: string;
}

const Feature = ({ title, description }: FeatureProps) => (
  <div className="flex gap-3">
    <div className="shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
    <div>
      <h3 className="font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);
