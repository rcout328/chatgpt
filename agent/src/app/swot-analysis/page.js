"use client";

import BusinessInput from '../../components/BusinessInput';
import { useBusinessContext } from '../../context/BusinessContext';

export default function SWOTAnalysisPage() {
  const { analysisResults } = useBusinessContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">SWOT Analysis</h2>
      <BusinessInput />
      
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="mr-2">⚖️</span> SWOT Analysis
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
          {analysisResults.swotAnalysis ? (
            <div className="prose text-black whitespace-pre-wrap">
              {analysisResults.swotAnalysis}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              SWOT analysis results will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 