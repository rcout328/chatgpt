"use client";

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

let socket;
const API_URL = 'http://localhost:5002';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [marketAnalysis, setMarketAnalysis] = useState('');
  const [competitorAnalysis, setCompetitorAnalysis] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeSocket();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeSocket = async () => {
    if (typeof window !== 'undefined') {
      socket = io(API_URL, {
        transports: ['websocket'],
        upgrade: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.on('receive_message', (data) => {
        console.log('Received message:', data);
        if (data.type === 'error') {
          console.error('Error:', data.content);
          return;
        }

        // Handle different analysis types
        if (data.analysisType === 'market') {
          setMarketAnalysis(data.content);
        } else if (data.analysisType === 'competitor') {
          setCompetitorAnalysis(data.content);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Send market analysis request
      socket.emit('send_message', {
        message: `Perform a detailed market analysis for this startup/business: ${userInput}. Focus on market size, growth potential, target audience, and market trends.`,
        agent: 'MarketInsightCEO',
        analysisType: 'market'
      });

      // Send competitor analysis request
      socket.emit('send_message', {
        message: `Perform a detailed competitor analysis for this startup/business: ${userInput}. Focus on main competitors, their strengths, weaknesses, and market positioning.`,
        agent: 'MarketInsightCEO',
        analysisType: 'competitor'
      });

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Market Insight Analysis
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
                placeholder="Enter your startup/business details here..."
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
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Market Analysis Box */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">📊</span> Market Analysis
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
              {marketAnalysis ? (
                <div className="prose text-black whitespace-pre-wrap">{marketAnalysis}</div>
              ) : (
                <div className="text-gray-500 italic">
                  Market analysis results will appear here...
                </div>
              )}
            </div>
          </div>

          {/* Competitor Analysis Box */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">🔍</span> Competitor Analysis
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
              {competitorAnalysis ? (
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
