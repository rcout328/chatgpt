"use client";

import { useState, useEffect, useRef } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { Line, Bar } from 'react-chartjs-2';
import { callGroqApi } from '@/utils/groqApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MarketTrendsContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [marketAnalysis, setMarketAnalysis] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');
  const chartsRef = useRef(null);

  // Chart options with dark theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9ca3af',
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        color: '#9ca3af',
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  // Load stored analysis on mount and when userInput changes
  useEffect(() => {
    setMounted(true);
    const storedAnalysis = localStorage.getItem(`marketAnalysis_${userInput}`);
    
    if (storedAnalysis) {
      setMarketAnalysis(storedAnalysis);
      setMarketData(parseMarketData(storedAnalysis));
      setLastAnalyzedInput(userInput);
    } else {
      setMarketAnalysis('');
      setMarketData(null);
      if (mounted && userInput && !isLoading && userInput !== lastAnalyzedInput) {
        handleSubmit(new Event('submit'));
        setLastAnalyzedInput(userInput);
      }
    }
  }, [userInput, mounted]);

  // Parse market data from GROQ response
  const parseMarketData = (content) => {
    try {
      // Extract growth rates and market segments from GROQ response
      const growthRateMatches = content.match(/(\d+(?:\.\d+)?)\s*%\s*(?:growth|increase|rise)/gi);
      const segmentMatches = content.match(/(\w+(?:\s+\w+)*)\s*segment[s]?\s*(?::|accounts for|represents)?\s*(\d+(?:\.\d+)?)\s*%/gi);

      // Monthly Growth Data
      const monthlyGrowth = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Market Growth (%)',
          data: growthRateMatches 
            ? growthRateMatches.map(match => parseFloat(match.match(/(\d+(?:\.\d+)?)/)[0])).slice(0, 12)
            : Array(12).fill().map(() => Math.floor(Math.random() * 30) + 10),
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.5)',
          tension: 0.4,
        }],
      };

      // Market Segments Data
      const segments = segmentMatches 
        ? segmentMatches.map(match => {
            const [segment, percentage] = match.match(/(\w+(?:\s+\w+)*)\s*segment[s]?\s*(?::|accounts for|represents)?\s*(\d+(?:\.\d+)?)/i).slice(1);
            return { segment, percentage: parseFloat(percentage) };
          })
        : [
            { segment: 'Enterprise', percentage: 35 },
            { segment: 'SMB', percentage: 25 },
            { segment: 'Consumer', percentage: 20 },
            { segment: 'Government', percentage: 12 },
            { segment: 'Education', percentage: 8 },
          ];

      const marketSegments = {
        labels: segments.map(s => s.segment),
        datasets: [{
          label: 'Market Share (%)',
          data: segments.map(s => s.percentage),
          backgroundColor: [
            'rgba(147, 51, 234, 0.5)',
            'rgba(59, 130, 246, 0.5)',
            'rgba(16, 185, 129, 0.5)',
            'rgba(245, 158, 11, 0.5)',
            'rgba(239, 68, 68, 0.5)',
          ],
          borderColor: [
            'rgb(147, 51, 234)',
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 1,
        }],
      };

      return { monthlyGrowth, marketSegments };
    } catch (error) {
      console.error('Error parsing market data:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are a market analysis expert. Analyze market trends and provide detailed insights with specific numbers and percentages that can be visualized. Include monthly growth rates and market segment distributions in your analysis.`
        },
        {
          role: "user",
          content: `Analyze market trends for this business: ${userInput}. 
          Please provide:
          1. Monthly Growth Rates
             - Include specific growth percentages for recent months
             - Format as "X% growth" for each data point
          2. Market Segments
             - List major market segments
             - Include specific percentage for each segment
             - Format as "Segment name: X%"
          3. Market Analysis
             - Overall market size
             - Key trends
             - Growth drivers
             - Market dynamics
          
          Format the response with clear numerical data that can be extracted for visualization.`
        }
      ]);

      setMarketAnalysis(response);
      setMarketData(parseMarketData(response));
      localStorage.setItem(`marketAnalysis_${userInput}`, response);
      setLastAnalyzedInput(userInput);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const router = useRouter();

  const handleCompetitorTracking = () => {
    router.push('/competitor-tracking');
  };

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204);
      pdf.text('Market Trends Analysis Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Add business name
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const businessName = userInput.substring(0, 50);
      pdf.text(`Business: ${businessName}${userInput.length > 50 ? '...' : ''}`, margin, currentY);
      currentY += 20;

      // Add market analysis content
      pdf.setFontSize(11);
      const analysisLines = pdf.splitTextToSize(marketAnalysis, pageWidth - (2 * margin));
      for (const line of analysisLines) {
        if (currentY + 10 > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += 10;
      }

      // Add charts if available
      if (chartsRef.current && marketData) {
        pdf.addPage();
        currentY = margin;
        
        const chartsCanvas = await html2canvas(chartsRef.current);
        const chartsImage = chartsCanvas.toDataURL('image/png');
        const chartsAspectRatio = chartsCanvas.width / chartsCanvas.height;
        const chartsWidth = pageWidth - (2 * margin);
        const chartsHeight = chartsWidth / chartsAspectRatio;

        pdf.addImage(chartsImage, 'PNG', margin, currentY, chartsWidth, chartsHeight);
      }

      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        pdf.text('Confidential - Market Trends Analysis', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      pdf.save('market-trends-analysis.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#131314] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Market Trends Analysis
            </h1>
            <p className="text-gray-400 mt-2">Analyze market trends and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            {marketAnalysis && (
              <button
                onClick={exportToPDF}
                className="bg-[#1D1D1F] hover:bg-[#2D2D2F] text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all"
              >
                <span>📥</span>
                <span>Export PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#1D1D1F] p-1 rounded-xl mb-8 inline-flex">
          <button 
            className="px-4 py-2 rounded-lg bg-purple-600 text-white"
          >
            Market Trends
          </button>
          <button 
            onClick={handleCompetitorTracking}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/50 transition-all duration-200"
          >
            Competitor Tracking
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Charts Section */}
          {marketData && (
            <div ref={chartsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Growth Trend Chart */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <div className="h-[400px]">
                  <Line 
                    options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      aspectRatio: 1.5,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: 'Market Growth Over Time'
                        }
                      }
                    }} 
                    data={marketData.monthlyGrowth}
                  />
                </div>
              </div>

              {/* Market Segments Chart */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <div className="h-[400px]">
                  <Bar 
                    options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      aspectRatio: 1.5,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: 'Market Share Distribution'
                        }
                      }
                    }} 
                    data={marketData.marketSegments}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="bg-[#1D1D1F] rounded-2xl border border-purple-500/10 p-6">
          {error ? (
            <div className="text-red-500">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : marketAnalysis ? (
            <div className="prose text-gray-300 max-w-none">
              <div className="whitespace-pre-wrap">{marketAnalysis}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}