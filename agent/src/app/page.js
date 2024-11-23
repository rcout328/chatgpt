"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStoredInput } from '@/hooks/useStoredInput';

export default function Dashboard() {
  const [userInput, setUserInput] = useStoredInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Store input and redirect to market trends
      localStorage.setItem('businessInput', userInput);
      router.push('/market-trends');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render until client-side mounting is complete
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Business Analysis Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your business details once and get comprehensive analysis across all our tools.
          </p>
        </header>

        {/* Input Form */}
        <div className="mb-12">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="mb-6">
              <label htmlFor="businessInput" className="block text-lg font-medium text-gray-700 mb-2">
                Business Details
              </label>
              <textarea
                id="businessInput"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your business or startup in detail. Include information about your products/services, target market, and business model..."
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 h-48 resize-none text-black"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !userInput.trim()}
              className={`w-full p-4 rounded-lg font-medium transition-colors ${
                !isSubmitting && userInput.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Starting Analysis...' : 'Start Analysis'}
            </button>
          </form>
        </div>

        {/* Analysis Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Market Analysis Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">📊</span> Market Analysis
            </h3>
            <p className="text-gray-600 mb-4">
              Analyze market trends, size, and growth potential for your business.
            </p>
          </div>

          {/* Competitor Analysis Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">🎯</span> Competitor Analysis
            </h3>
            <p className="text-gray-600 mb-4">
              Understand your competition and market positioning.
            </p>
          </div>

          {/* SWOT Analysis Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">⚖️</span> SWOT Analysis
            </h3>
            <p className="text-gray-600 mb-4">
              Identify strengths, weaknesses, opportunities, and threats.
            </p>
          </div>

          {/* Feature Priority Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">⭐</span> Feature Priority
            </h3>
            <p className="text-gray-600 mb-4">
              Prioritize features and development roadmap.
            </p>
          </div>

          {/* Compliance Check Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">📋</span> Compliance Check
            </h3>
            <p className="text-gray-600 mb-4">
              Ensure regulatory compliance and risk assessment.
            </p>
          </div>

          {/* Impact Assessment Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">⚡</span> Impact Assessment
            </h3>
            <p className="text-gray-600 mb-4">
              Evaluate business impact and sustainability.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
