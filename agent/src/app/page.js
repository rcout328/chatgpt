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
      // Store input in local storage
      localStorage.setItem('businessInput', userInput);

      // Emit messages for both analyses
      await safeEmit('send_message', {
        message: `Perform a detailed market analysis for this startup/business: ${userInput}. 
        Please analyze:
        1. Market Trends
           - Current market dynamics
           - Emerging trends
           - Consumer behavior patterns
           - Industry-specific developments
        2. Market Size
           - Total addressable market
           - Market growth rate
           - Market segments
           - Geographic distribution
        3. Target Audience
           - Customer demographics
           - Customer needs and preferences
           - Market penetration opportunities
           - Customer acquisition channels
        4. Competitive Landscape
           - Key competitors
           - Market positioning
           - Competitive advantages
           - Market share distribution`,
        agent: 'MarketInsightCEO',
        analysisType: 'market'
      });

      await safeEmit('send_message', {
        message: `Perform a comprehensive competitor analysis for this business: ${userInput}. 
        Please analyze:
        1. Direct Competitors
           - Key market players
           - Market share analysis
           - Competitive positioning
           - Core offerings
        2. Competitor Strengths
           - Unique selling propositions
           - Market advantages
           - Resource capabilities
           - Brand reputation
        3. Competitor Weaknesses
           - Service gaps
           - Market limitations
           - Operational challenges
           - Customer pain points
        4. Strategic Analysis
           - Pricing strategies
           - Marketing approaches
           - Distribution channels
           - Growth tactics`,
        agent: 'MarketInsightCEO',
        analysisType: 'competitor'
      });

      // Redirect to market trends page
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
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Details
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Describe your business, products/services, target market, and business model..."
                className="w-full p-3 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !userInput.trim()}
              className="w-full p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              {isSubmitting ? 'Starting Analysis...' : 'Start Analysis'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}