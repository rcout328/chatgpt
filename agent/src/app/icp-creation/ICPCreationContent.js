"use client";

import { useState, useEffect } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { callGroqApi } from '@/utils/groqApi';
import ChatDialog from '@/components/ChatDialog';

export default function ICPCreationContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [icpAnalysis, setIcpAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');

  // Load stored analysis on mount and when userInput changes
  useEffect(() => {
    setMounted(true);
    const storedAnalysis = localStorage.getItem(`icpAnalysis_${userInput}`);
    
    if (storedAnalysis) {
      setIcpAnalysis(storedAnalysis);
      setLastAnalyzedInput(userInput);
    } else {
      setIcpAnalysis('');
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
    const storedAnalysis = localStorage.getItem(`icpAnalysis_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setIcpAnalysis(storedAnalysis);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are an expert at creating Ideal Customer Profiles (ICP). Create a detailed ICP analysis that covers all key aspects of the target customer. Focus on providing specific, actionable insights.`
        },
        {
          role: "user",
          content: `Create a detailed Ideal Customer Profile (ICP) for this business: ${userInput}. 
          Please analyze and provide:
          1. Demographics
             - Age range
             - Income level
             - Location
             - Education
          2. Psychographics
             - Values and beliefs
             - Lifestyle
             - Interests
             - Behaviors
          3. Professional Characteristics
             - Industry
             - Company size
             - Role/Position
             - Decision-making authority
          4. Pain Points & Needs
             - Key challenges
             - Motivations
             - Goals
             - Purchase triggers
          
          Format the response in a clear, structured manner with specific details and insights.`
        }
      ]);

      setIcpAnalysis(response);
      localStorage.setItem(`icpAnalysis_${userInput}`, response);
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
            Ideal Customer Profile Creation
          </h1>
          <div className="absolute right-0 top-0">
            <ChatDialog currentPage="icpCreation" />
          </div>
        </header>

        {/* Input Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="mb-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your business details for ICP creation..."
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
              {isLoading ? 'Creating...' : 'Create ICP'}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-1 gap-6">
          {/* ICP Analysis Box */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">👥</span> Ideal Customer Profile
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
              ) : icpAnalysis ? (
                <div className="prose text-black whitespace-pre-wrap">{icpAnalysis}</div>
              ) : (
                <div className="text-gray-500 italic">
                  ICP analysis results will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 