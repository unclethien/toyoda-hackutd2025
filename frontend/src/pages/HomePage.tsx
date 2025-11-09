import { useAuth0 } from "@auth0/auth0-react";
import { Phone, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
      <div className="min-h-screen flex items-center justify-center bg-functional-gray">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Phone size={64} className="text-toyoda-red" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">TOYODA</h1>
          <p className="text-lg text-gray-700">
            Automated dealer outreach for the best car prices
          </p>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg p-6 space-y-4 text-left">
          <Feature
            title="Search Any Car"
            description="Enter your desired model, type, and location"
          />
          <Feature
            title="AI Calls Dealers"
            description="Our AI contacts all dealers in your area automatically"
          />
          <Feature
            title="Compare Quotes"
            description="Get the best out-the-door prices in one place"
          />
        </div>

        {/* CTA Button */}
        <button
          onClick={() => loginWithRedirect()}
          className="w-full bg-toyoda-red text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          Get Started
          <ArrowRight size={24} />
        </button>

        <p className="text-sm text-gray-400">
          Free to use • No credit card required
        </p>
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
    <div className="shrink-0 w-2 h-2 bg-toyoda-red rounded-full mt-2" />
    <div>
      <h3 className="font-bold text-functional-gray">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);
