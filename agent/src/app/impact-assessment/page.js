"use client";

import BusinessInput from '../../components/BusinessInput';
import { useBusinessContext } from '../../context/BusinessContext';

export default function ImpactAssessmentPage() {
  const { analysisResults } = useBusinessContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Impact Assessment</h2>
      <BusinessInput />
      
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
          <span className="mr-2">⚡</span> Impact/Resource Scoring
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
          {analysisResults.impactScoring ? (
            <div className="prose text-black whitespace-pre-wrap">
              {analysisResults.impactScoring}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Impact and resource scoring results will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 