"use client";

import { useState, useEffect } from 'react';
import { socket, safeEmit, checkConnection } from '@/config/socket';

export default function ImpactAssessmentContent() {
  const [userInput, setUserInput] = useState('');
  const [impactAnalysis, setImpactAnalysis] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

      if (data.analysisType === 'impact') {
        setImpactAnalysis(data.content);
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await safeEmit('send_message', {
        message: `Perform a comprehensive impact assessment for this business: ${userInput}. 
        Please analyze:
        1. Social Impact
           - Community benefits
           - Job creation and employment
           - Social value creation
           - Stakeholder engagement
        2. Economic Impact
           - Local economic contribution
           - Market influence
           - Economic sustainability
           - Value chain impact
        3. Environmental Impact
           - Environmental footprint
           - Resource utilization
           - Sustainability practices
           - Environmental initiatives
        4. Long-term Impact
           - Scalability potential
           - Future impact projections
           - Sustainability goals
           - Legacy considerations`,
        agent: 'MarketInsightCEO',
        analysisType: 'impact'
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send analysis request. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Impact Assessment Analysis
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
                placeholder="Enter your business details for impact assessment..."
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
              {isLoading ? 'Analyzing...' : 'Analyze Impact'}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-1 gap-6">
          {/* Impact Analysis Box */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">⚡</span> Impact Assessment
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
              ) : impactAnalysis ? (
                <div className="prose text-black whitespace-pre-wrap">{impactAnalysis}</div>
              ) : (
                <div className="text-gray-500 italic">
                  Impact assessment results will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 