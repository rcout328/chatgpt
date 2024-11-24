"use client";

import { useState, useEffect } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { callGroqApi } from '@/utils/groqApi';
import ChatDialog from '@/components/ChatDialog';

export default function FeedbackCollectionContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [feedbackAnalysis, setFeedbackAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');

  // Load stored analysis on mount and when userInput changes
  useEffect(() => {
    setMounted(true);
    const storedAnalysis = localStorage.getItem(`feedbackAnalysis_${userInput}`);
    
    if (storedAnalysis) {
      setFeedbackAnalysis(storedAnalysis);
      setLastAnalyzedInput(userInput);
    } else {
      setFeedbackAnalysis('');
      // Auto-submit only if input is different from last analyzed
      if (mounted && userInput && !isLoading && userInput !== lastAnalyzedInput) {
        handleSubmit(new Event('submit'));
        setLastAnalyzedInput(userInput);
      }
    }
  }, [userInput, mounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    // Check if analysis already exists for this exact input
    const storedAnalysis = localStorage.getItem(`feedbackAnalysis_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setFeedbackAnalysis(storedAnalysis);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are a feedback analysis expert. Create a detailed feedback analysis that covers all key aspects of customer feedback and satisfaction. Focus on providing specific, actionable insights about customer experience and improvement opportunities.`
        },
        {
          role: "user",
          content: `Analyze customer feedback and satisfaction for this business: ${userInput}. 
          Please analyze:
          1. Customer Satisfaction
             - Overall satisfaction levels
             - Key satisfaction drivers
             - Satisfaction trends
             - Customer loyalty indicators
          2. Feedback Patterns
             - Common themes
             - Recurring issues
             - Positive highlights
             - Improvement suggestions
          3. Service Quality
             - Service delivery assessment
             - Response time analysis
             - Support effectiveness
             - Quality consistency
          4. Recommendations
             - Priority improvements
             - Action items
             - Implementation suggestions
             - Follow-up measures
          
          Format the response in a clear, structured manner with specific details for each component.`
        }
      ]);

      setFeedbackAnalysis(response);
      localStorage.setItem(`feedbackAnalysis_${userInput}`, response);
      setLastAnalyzedInput(userInput);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Feedback Collection & Analysis
          </h1>
          <div className="absolute right-0 top-0">
            <ChatDialog currentPage="feedbackCollection" />
          </div>
        </header>

        {/* Input Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="mb-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your business details for feedback analysis..."
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-none text-black"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className={`w-full p-4 rounded-lg font-medium transition-colors ${
                !isLoading && userInput.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Feedback'}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-1 gap-6">
          {/* Feedback Analysis Box */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">📝</span> Feedback Analysis
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
              {error ? (
                <div className="text-red-500">
                  {error}
                  <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : feedbackAnalysis ? (
                <div className="prose text-black whitespace-pre-wrap">{feedbackAnalysis}</div>
              ) : (
                <div className="text-gray-500 italic">
                  Feedback analysis results will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 