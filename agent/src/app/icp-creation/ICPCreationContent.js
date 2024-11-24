"use client";

import { useState, useEffect } from 'react';
import { socket, safeEmit, checkConnection } from '@/config/socket';
import { useStoredInput } from '@/hooks/useStoredInput';
import ChatDialog from '@/components/ChatDialog'; // Importing ChatDialog component

export default function ICPCreationContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [icpAnalysis, setIcpAnalysis] = useState('');
  const [isConnected, setIsConnected] = useState(false);
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
      if (isConnected && mounted && userInput && !isLoading && userInput !== lastAnalyzedInput) {
        handleSubmit(new Event('submit'));
        setLastAnalyzedInput(userInput);
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

      if (data.analysisType === 'icp') {
        const analysisResult = data.content;
        setIcpAnalysis(analysisResult);
        // Store the analysis result and update last analyzed input
        localStorage.setItem(`icpAnalysis_${userInput}`, analysisResult);
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
    const storedAnalysis = localStorage.getItem(`icpAnalysis_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setIcpAnalysis(storedAnalysis);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await safeEmit('send_message', {
        message: `Create a detailed Ideal Customer Profile (ICP) for this business: ${userInput}. 
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
           - Purchase triggers`,
        agent: 'MarketInsightCEO',
        analysisType: 'icp'
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
            Ideal Customer Profile Creation
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
                placeholder="Enter your business details for ICP creation..."
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
        <div className="absolute right-0 top-0">
          <ChatDialog currentPage="icpCreation" />
        </div>
      </div>
    </main>
  );
} 