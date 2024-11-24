"use client";

import { useState, useEffect } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { callGroqApi } from '@/utils/groqApi';
import ChatDialog from '@/components/ChatDialog';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CompetitorTrackingContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [competitorAnalysis, setCompetitorAnalysis] = useState('');
  const [competitorData, setCompetitorData] = useState(null);
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
      setCompetitorData(parseCompetitorData(storedAnalysis));
      setLastAnalyzedInput(userInput);
    } else {
      setCompetitorAnalysis('');
      setCompetitorData(null);
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
    const storedAnalysis = localStorage.getItem(`competitorAnalysis_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setCompetitorAnalysis(storedAnalysis);
      setCompetitorData(parseCompetitorData(storedAnalysis));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are a competitive analysis expert. Analyze competitors and provide detailed insights with specific numbers and percentages that can be visualized. Focus on providing clear, quantifiable data points for market shares and competitive positioning.`
        },
        {
          role: "user",
          content: `Perform a detailed competitor analysis for the business: ${userInput}. 
          Please analyze and provide insights on the following aspects:
          1. Direct Competitors
          • Identify key players in the market and their competitive positioning.
          • Assess their market share (provide specific percentages) and core offerings.
          2. Competitor Strengths
          • Highlight unique selling propositions, market advantages, resource capabilities, and brand reputation.
          3. Competitor Weaknesses
          • Identify service gaps, operational challenges, market limitations, and common customer pain points.
          4. Strategic Analysis
          • Evaluate pricing strategies, marketing approaches, distribution channels, and growth tactics.

          Important: Include specific percentages for market shares and competitive metrics that can be used for visualization.
          Format market share data as "CompanyName has XX%" for easy parsing.`
        }
      ]);

      setCompetitorAnalysis(response);
      const parsedData = parseCompetitorData(response);
      setCompetitorData(parsedData);
      localStorage.setItem(`competitorAnalysis_${userInput}`, response);
      setLastAnalyzedInput(userInput);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Parse competitor data from GROQ response
  const parseCompetitorData = (content) => {
    try {
      // Extract competitor names and market share percentages
      const competitors = content.match(/(\w+(?:\s+\w+)*)\s*(?:has|with|at)\s*(\d+(?:\.\d+)?)\s*%/gi);
      const marketShareData = {
        labels: [],
        datasets: [{
          label: 'Market Share (%)',
          data: [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        }],
      };

      if (competitors) {
        competitors.forEach(match => {
          const [name, share] = match.match(/(\w+(?:\s+\w+)*)\s*(?:has|with|at)\s*(\d+(?:\.\d+)?)/i).slice(1);
          marketShareData.labels.push(name);
          marketShareData.datasets[0].data.push(parseFloat(share));
        });
      }

      return marketShareData;
    } catch (error) {
      console.error('Error parsing competitor data:', error);
      return null;
    }
  };

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Market Share Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Market Share (%)',
        },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Competitive Analysis Radar',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
      },
    },
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Competitor Tracking Analysis
          </h1>
          <div className="absolute right-0 top-0">
            <ChatDialog currentPage="competitorTracking" />
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

        {/* Competitor Visualization Section */}
        {competitorData && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Market Share Chart */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="h-[400px]">
                <Bar options={barOptions} data={competitorData} />
              </div>
            </div>

            {/* Competitive Analysis Radar */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="h-[400px]">
                <Radar options={radarOptions} data={competitorData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}