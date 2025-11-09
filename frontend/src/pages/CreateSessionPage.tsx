import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { carDatabase } from "../data/carData";

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
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <button
          onClick={() => navigate("/sessions")}
          className="flex items-center gap-2 text-functional-gray hover:text-toyoda-red mb-3"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-functional-gray">
          New Car Search
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Enter details for your car search
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Make (Manufacturer) */}
        <div>
          <label className="block text-sm font-semibold text-functional-gray mb-2">
            Make *
          </label>
          <select
            value={formData.make}
            onChange={(e) => handleMakeChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${errors.make ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-toyoda-red`}
          >
            <option value="">Select make</option>
            {carDatabase.map((make) => (
              <option key={make.name} value={make.name}>
                {make.name}
              </option>
            ))}
          </select>
          {errors.make && (
            <p className="text-red-500 text-sm mt-1">{errors.make}</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-semibold text-functional-gray mb-2">
            Model *
          </label>
          <select
            value={formData.model}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={!formData.make}
            className={`w-full px-4 py-3 rounded-lg border ${errors.model ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-toyoda-red disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">
              {formData.make ? "Select model" : "Select make first"}
            </option>
            {availableModels.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
          {errors.model && (
            <p className="text-red-500 text-sm mt-1">{errors.model}</p>
          )}
        </div>

        {/* Version/Trim */}
        <div>
          <label className="block text-sm font-semibold text-functional-gray mb-2">
            Version/Trim *
          </label>
          <select
            value={formData.version}
            onChange={(e) =>
              setFormData({ ...formData, version: e.target.value })
            }
            disabled={!formData.model}
            className={`w-full px-4 py-3 rounded-lg border ${errors.version ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-toyoda-red disabled:bg-gray-100 disabled:cursor-not-allowed`}
          >
            <option value="">
              {formData.model ? "Select version" : "Select model first"}
            </option>
            {availableVersions.map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </select>
          {errors.version && (
            <p className="text-red-500 text-sm mt-1">{errors.version}</p>
          )}
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-semibold text-functional-gray mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            placeholder="75007"
            maxLength={5}
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({ ...formData, zipCode: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${errors.zipCode ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-toyoda-red`}
          />
          {errors.zipCode && (
            <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
          )}
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-semibold text-functional-gray mb-2">
            Search Radius: {formData.radiusMiles} miles
          </label>
          <input
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
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 miles</span>
            <span>50 miles</span>
          </div>
          {errors.radiusMiles && (
            <p className="text-red-500 text-sm mt-1">{errors.radiusMiles}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-toyoda-red text-white py-4 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          <Search size={24} />
          {loadingMessage || (isSubmitting ? "Searching..." : "Search Dealers")}
        </button>
      </form>
    </div>
  );
};
