"use client";

import BusinessInput from '../../components/BusinessInput';
import { useBusinessContext } from '../../context/BusinessContext';

export default function MarketAssessmentPage() {
  const { analysisResults } = useBusinessContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Market Assessment</h2>
      <BusinessInput />
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Market Size Box */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">📏</span> Market Size
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
            {analysisResults.marketSize ? (
              <div className="prose text-black whitespace-pre-wrap">
                {analysisResults.marketSize}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Market size analysis will appear here...
              </div>
            )}
          </div>
        </div>

        {/* Competition Heat Map Box */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">🌡️</span> Competition Heat Map
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
            {analysisResults.competitionHeat ? (
              <div className="prose text-black whitespace-pre-wrap">
                {analysisResults.competitionHeat}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Competition heat map will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} s