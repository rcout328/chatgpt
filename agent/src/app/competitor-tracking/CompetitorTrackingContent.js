"use client";

import { useState, useEffect } from 'react';
import { socket, safeEmit, checkConnection } from '@/config/socket';
import { useStoredInput } from '@/hooks/useStoredInput';

export default function CompetitorTrackingContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [competitorAnalysis, setCompetitorAnalysis] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');

  // Load stored analysis on mount and when userInput changes
  useEffect(() => {
    setMounted(true);
    const storedAnalysis = localStorage.getItem(`competitorAnalysis_${userInput}`);
    
    if (storedAnalysis) {
      setCompetitorAnalysis(storedAnalysis);
      setLastAnalyzedInput(userInput); // Track this input as analyzed
    } else {
      setCompetitorAnalysis('');
      // Auto-submit only if input is different from last analyzed
      if (isConnected && mounted && userInput && !isLoading && userInput !== lastAnalyzedInput) {
        handleSubmit(new Event('submit'));
        setLastAnalyzedInput(userInput); // Update last analyzed input
      }
    }
  }, [userInput, isConnected, mounted]); // Dependencies include connection status

  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    };

    const handleReceiveMessage = (data) => {
      console.log('Received message:', data);
      setIsLoading(false);
      
      if (data.type === 'error') {
        setError(data.content);
        return;
      }

      if (data.analysisType === 'competitor') {
        const analysisResult = data.content;
        setCompetitorAnalysis(analysisResult);
        // Store the analysis result and update last analyzed input
        localStorage.setItem(`competitorAnalysis_${userInput}`, analysisResult);
        setLastAnalyzedInput(userInput);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Connection error. Retrying...');
    });

    setIsConnected(checkConnection());

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('connect_error');
    };
  }, [userInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    // Check if analysis already exists for this exact input
    const storedAnalysis = localStorage.getItem(`competitorAnalysis_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setCompetitorAnalysis(storedAnalysis);
      return; // Don't proceed with API call if we have stored results for this input
    }

    setIsLoading(true);
    setError(null);

    try {
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

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send analysis request. Please try again.');
      setIsLoading(false);
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Competitor Tracking Analysis
          </h1>
          <div className="text-sm text-gray-500">
            {isConnected ? 
              <span className="text-green-500">●</span> : 
              <span className="text-red-500">●</span>
            } {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </header>

        {/* Input Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="mb-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your business details for competitor analysis..."
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-none text-black"
                disabled={!isConnected || isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!isConnected || isLoading}
              className={`w-full p-4 rounded-lg font-medium transition-colors ${
                isConnected && !isLoading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Competitors'}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-1 gap-6">
          {/* Competitor Analysis Box */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">🎯</span> Competitor Analysis
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
              ) : competitorAnalysis ? (
                <div className="prose text-black whitespace-pre-wrap">{competitorAnalysis}</div>
              ) : (
                <div className="text-gray-500 italic">
                  Competitor analysis results will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}