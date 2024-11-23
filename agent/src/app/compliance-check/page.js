"use client";

import BusinessInput from '../../components/BusinessInput';
import { useBusinessContext } from '../../context/BusinessContext';

export default function ComplianceCheckPage() {
  const { analysisResults } = useBusinessContext();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Compliance & Risk Assessment</h2>
      <BusinessInput />
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Regulatory Checklist Box */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">📋</span> Regulatory Checklist
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
            {analysisResults.regulatoryChecklist ? (
              <div className="prose text-black whitespace-pre-wrap">
                {analysisResults.regulatoryChecklist}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Regulatory checklist will appear here...
              </div>
            )}
          </div>
        </div>

        {/* Risk Assessment Box */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
            <span className="mr-2">⚠️</span> Risk Assessment
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[250px] overflow-auto">
            {analysisResults.riskAssessment ? (
              <div className="prose text-black whitespace-pre-wrap">
                {analysisResults.riskAssessment}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Risk assessment will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 