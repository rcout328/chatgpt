"use client";

import { useState, useEffect } from 'react';
import { socket, safeEmit, checkConnection } from '@/config/socket';
import { useStoredInput } from '@/hooks/useStoredInput';

export default function FeedbackCollectionContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [feedbackAnalysis, setFeedbackAnalysis] = useState('');
  const [isConnected, setIsConnected] = useState(false);
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
      setLastAnalyzedInput(userInput); // Track this input as analyzed
    } else {
      setFeedbackAnalysis('');
      // Auto-submit only if input is different from last analyzed
      if (isConnected && mounted && userInput && !isLoading && userInput !== lastAnalyzedInput) {
        handleSubmit(new Event('submit'));
        setLastAnalyzedInput(userInput); // Update last analyzed input
      }
    }
  }, [userInput, isConnected, mounted]);

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

      if (data.analysisType === 'feedback') {
        const analysisResult = data.content;
        setFeedbackAnalysis(analysisResult);
        // Store the analysis result and update last analyzed input
        localStorage.setItem(`feedbackAnalysis_${userInput}`, analysisResult);
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
    const storedAnalysis = localStorage.getItem(`feedbackAnalysis_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setFeedbackAnalysis(storedAnalysis);
      return; // Don't proceed with API call if we have stored results for this input
    }

    setIsLoading(true);
    setError(null);

    try {
      await safeEmit('send_message', {
        message: `Analyze customer feedback and satisfaction for this business: ${userInput}. 
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
           - Follow-up measures`,
        agent: 'MarketInsightCEO',
        analysisType: 'feedback'
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send analysis request. Please try again.');
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Feedback Collection & Analysis
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
                placeholder="Enter your business details for feedback analysis..."
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