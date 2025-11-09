import { useState, useRef, useEffect } from "react";
import { Mic } from "lucide-react";

interface InputSectionProps {
  isExpanded: boolean;
}

export const InputSection = ({ isExpanded }: InputSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // TODO: Implement search logic
  };

  const handleVoiceInput = () => {
    console.log("Voice input activated");
    // TODO: Implement voice input using Web Speech API
  };

  useEffect(() => {
    if (sectionRef.current) {
      if (isExpanded) {
        sectionRef.current.style.height =
          sectionRef.current.scrollHeight + "px";
      } else {
        sectionRef.current.style.height = "0px";
      }
    }
  }, [isExpanded]);

  return (
    <section
      ref={sectionRef}
      className={`relative bg-white transition-all duration-500 ease-in-out overflow-hidden ${
        isExpanded ? "input-expanded py-6 shadow-md" : "input-collapsed"
      }`}
      style={{ height: "0px" }}
    >
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6 text-functional-gray">
          Your Journey Starts Here
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <button
            onClick={handleVoiceInput}
            className="bg-functional-gray text-white p-4 rounded-full flex-shrink-0 hover:bg-black transition-colors"
            aria-label="Voice input"
          >
            <Mic size={28} />
          </button>
          <input
            type="text"
            placeholder="e.g., 'RAV4 in blue, ZIP 90210'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-4 border border-gray-300 rounded-lg focus:border-toyoda-red focus:ring-1 focus:ring-toyoda-red text-functional-gray placeholder-gray-400"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="btn-primary flex-shrink-0 px-6 py-4"
          >
            Search
          </button>
        </div>
        <p className="text-sm text-functional-gray opacity-75">
          Speak or type the model, color, and your ZIP code for instant local
          deals.
        </p>
        <img
          src="https://storage.googleapis.com/forge-sites/b7724ad960d2e203cd3fe9a3a81d4b59b5ec216e9e908c251492010d062033ef.webp?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=164061697651-compute%40developer.gserviceaccount.com%2F20251109%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251109T001736Z&X-Goog-Expires=86400&X-Goog-SignedHeaders=host&response-access-control-allow-origin=https%3A%2F%2Fforge.moonchild.ai&X-Goog-Signature=7693d49327b73010fac0a1d80420bf78d409b887d0d10b68ea58d21bcce470a536d63dc8b2a17a9283f28f5d47ab93af66d023acfa89a72f41fe73c24fa907b0ca531f4b7f42fa34f2cfeaf1bf0bfb007b76c7f0b3440489cdae6e9a1abeecdade14c8f507ef4abdeb86b7f19b07f62861cb3eecc1879992b1186266096dafc05198d4992f3296cb015c1c111e740a49cf1ab3b7fb6b2fdb8f736c7c818e21ef57e3325aec70442dbceb503d8f8459ce711ece3dafff02b78da8a9acc5b76d87e9236677063a40353140f3c4f6c17580d29c6e0203e283d010cac2d06c6839f4a59f5855f48116647af95bfca267789282090cd8e3d71bbd138e5db950eea4b8"
          alt="Static representation of a voice waveform"
          className="w-full max-w-sm mx-auto mt-4 p-2"
        />
      </div>
    </section>
  );
};
