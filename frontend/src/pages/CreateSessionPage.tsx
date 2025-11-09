import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { carDatabase } from "../data/carData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CreateSessionPage = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const createSession = useMutation(api.sessions.create);
  const fetchDealers = useAction(api.actions.fetchDealers);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    version: "",
    zipCode: "",
    radiusMiles: "25",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Cascading dropdown logic
  const availableModels = useMemo(() => {
    if (!formData.make) return [];
    const selectedMake = carDatabase.find(
      (make) => make.name === formData.make
    );
    return selectedMake?.models || [];
  }, [formData.make]);

  const availableVersions = useMemo(() => {
    if (!formData.model) return [];
    const selectedModel = availableModels.find(
      (model) => model.name === formData.model
    );
    return selectedModel?.versions || [];
  }, [formData.model, availableModels]);

  // Reset dependent fields when parent changes
  const handleMakeChange = (make: string) => {
    setFormData({
      ...formData,
      make,
      model: "", // Reset model
      version: "", // Reset version
    });
  };

  const handleModelChange = (model: string) => {
    setFormData({
      ...formData,
      model,
      version: "", // Reset version
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.make) newErrors.make = "Make is required";
    if (!formData.model) newErrors.model = "Model is required";
    if (!formData.version) newErrors.version = "Version is required";

    const zipRegex = /^\d{5}$/;
    if (!formData.zipCode) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = "Must be a valid 5-digit ZIP code";
    }

    const radius = parseInt(formData.radiusMiles);
    if (isNaN(radius) || radius < 0 || radius > 50) {
      newErrors.radiusMiles = "Radius must be between 0-50 miles";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !user?.sub) return;

    setIsSubmitting(true);
    setLoadingMessage("Creating session...");

    try {
      // Step 1: Create session
      const sessionId = await createSession({
        userId: user.sub,
        carType: `${formData.make} ${formData.model}`, // Combine make and model for carType
        model: formData.model,
        version: formData.version,
        zipCode: formData.zipCode,
        radiusMiles: parseInt(formData.radiusMiles),
      });

      // Step 2: Fetch dealers from CARFAX API
      setLoadingMessage("Fetching dealers...");
      await fetchDealers({ sessionId });

      // Step 3: Navigate to detail page
      navigate(`/sessions/${sessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create session. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <Button
          onClick={() => navigate("/sessions")}
          variant="ghost"
          size="sm"
          className="mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          New Car Search
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter details for your car search
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Make (Manufacturer) */}
        <div className="space-y-2">
          <Label htmlFor="make">
            Make *
          </Label>
          <Select
            value={formData.make}
            onValueChange={handleMakeChange}
          >
            <SelectTrigger id="make" className={errors.make ? "border-destructive" : ""}>
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              {carDatabase.map((make) => (
                <SelectItem key={make.name} value={make.name}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.make && (
            <p className="text-destructive text-sm">{errors.make}</p>
          )}
        </div>

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">
            Model *
          </Label>
          <Select
            value={formData.model}
            onValueChange={handleModelChange}
            disabled={!formData.make}
          >
            <SelectTrigger id="model" className={errors.model ? "border-destructive" : ""} disabled={!formData.make}>
              <SelectValue placeholder={formData.make ? "Select model" : "Select make first"} />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.model && (
            <p className="text-destructive text-sm">{errors.model}</p>
          )}
        </div>

        {/* Version/Trim */}
        <div className="space-y-2">
          <Label htmlFor="version">
            Version/Trim *
          </Label>
          <Select
            value={formData.version}
            onValueChange={(value) =>
              setFormData({ ...formData, version: value })
            }
            disabled={!formData.model}
          >
            <SelectTrigger id="version" className={errors.version ? "border-destructive" : ""} disabled={!formData.model}>
              <SelectValue placeholder={formData.model ? "Select version" : "Select model first"} />
            </SelectTrigger>
            <SelectContent>
              {availableVersions.map((version) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.version && (
            <p className="text-destructive text-sm">{errors.version}</p>
          )}
        </div>

        {/* ZIP Code */}
        <div className="space-y-2">
          <Label htmlFor="zipCode">
            ZIP Code *
          </Label>
          <Input
            id="zipCode"
            type="text"
            placeholder="75007"
            maxLength={5}
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({ ...formData, zipCode: e.target.value })
            }
            className={errors.zipCode ? "border-destructive" : ""}
          />
          {errors.zipCode && (
            <p className="text-destructive text-sm">{errors.zipCode}</p>
          )}
        </div>

        {/* Radius */}
        <div className="space-y-2">
          <Label htmlFor="radius">
            Search Radius: {formData.radiusMiles} miles
          </Label>
          <input
            id="radius"
            type="range"
            min="0"
            max="50"
            step="5"
            value={formData.radiusMiles}
            onChange={(e) =>
              setFormData({ ...formData, radiusMiles: e.target.value })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 miles</span>
            <span>50 miles</span>
          </div>
          {errors.radiusMiles && (
            <p className="text-destructive text-sm">{errors.radiusMiles}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="w-full mt-8"
        >
          <Search className="h-5 w-5" />
          {loadingMessage || (isSubmitting ? "Searching..." : "Search Dealers")}
        </Button>
      </form>
    </div>
  );
};
