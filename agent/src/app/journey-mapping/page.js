"use client";

import BusinessInput from '../../components/BusinessInput';
import { useBusinessContext } from '../../context/BusinessContext';

export default function JourneyMappingPage() {
  const { analysisResults } = useBusinessContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customer Journey Mapping</h2>
      <BusinessInput />
      
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="mr-2">🗺️</span> Journey Mapping
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
          {analysisResults.journeyMapping ? (
            <div className="prose text-black whitespace-pre-wrap">
              {analysisResults.journeyMapping}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Journey mapping results will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 