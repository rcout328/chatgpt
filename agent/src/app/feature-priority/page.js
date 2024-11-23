"use client";

import BusinessInput from '../../components/BusinessInput';
import { useBusinessContext } from '../../context/BusinessContext';

export default function FeaturePriorityPage() {
  const { analysisResults } = useBusinessContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Feature Priority & Timeline</h2>
      <BusinessInput />
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Feature Priority Box */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">⭐</span> Feature Priority
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
            {analysisResults.featurePriority ? (
              <div className="prose text-black whitespace-pre-wrap">
                {analysisResults.featurePriority}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Feature priority results will appear here...
              </div>
            )}
          </div>
        </div>

        {/* Timeline Box */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">⏱️</span> Timeline
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
            {analysisResults.timelines ? (
              <div className="prose text-black whitespace-pre-wrap">
                {analysisResults.timelines}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Timeline analysis will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 