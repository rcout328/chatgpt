"use client";

import BusinessInput from '../../components/BusinessInput';
import { useBusinessContext } from '../../context/BusinessContext';

export default function GapAnalysisPage() {
  const { analysisResults } = useBusinessContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gap Analysis & Strategy</h2>
      <BusinessInput />
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Gap Analysis Box */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">🎯</span> Labeled Gap Analysis
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
            {analysisResults.labeledGap ? (
              <div className="prose text-black whitespace-pre-wrap">
                {analysisResults.labeledGap}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Gap analysis results will appear here...
              </div>
            )}
          </div>
        </div>

        {/* Strategy Recommendations Box */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">💡</span> Strategy Recommendations
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
            {analysisResults.strategyRecommendations ? (
              <div className="prose text-black whitespace-pre-wrap">
                {analysisResults.strategyRecommendations}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Strategy recommendations will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 