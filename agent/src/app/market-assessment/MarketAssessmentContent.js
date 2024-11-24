"use client";

import { useState, useEffect, useRef } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { Line, Bar } from 'react-chartjs-2';
import { callGroqApi } from '@/utils/groqApi';
import { useRouter } from 'next/navigation';
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

export default function MarketAssessmentContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [marketAssessment, setMarketAssessment] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');
  const router = useRouter();

  // Add refs for PDF content
  const chartsRef = useRef(null);
  const analysisRef = useRef(null);

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

  // Handle navigation to Impact Assessment
  const handleImpactAssessment = () => {
    router.push('/impact-assessment');
  };

  // Load stored analysis on mount and when userInput changes
  useEffect(() => {
    setMounted(true);
    const storedAnalysis = localStorage.getItem(`marketAssessment_${userInput}`);
    
    if (storedAnalysis) {
      setMarketAssessment(storedAnalysis);
      setMarketData(parseMarketData(storedAnalysis));
      setLastAnalyzedInput(userInput);
    } else {
      setMarketAssessment('');
      setMarketData(null);
      if (mounted && userInput && !isLoading && userInput !== lastAnalyzedInput) {
        handleSubmit(new Event('submit'));
        setLastAnalyzedInput(userInput);
      }
    }
  }, [userInput, mounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const storedAnalysis = localStorage.getItem(`marketAssessment_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setMarketAssessment(storedAnalysis);
      setMarketData(parseMarketData(storedAnalysis));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are a market assessment expert. Create a detailed market assessment that covers all key aspects of the market. Focus on providing specific, actionable insights about market opportunities and challenges.`
        },
        {
          role: "user",
          content: `Create a detailed market assessment for this business: ${userInput}. 
          Please analyze and provide:
          1. Market Size & Growth
             - Total addressable market
             - Growth projections
             - Market dynamics
             - Key trends
          2. Market Segments
             - Customer segments
             - Segment sizes
             - Growth potential
             - Segment characteristics
          3. Market Opportunities
             - Unmet needs
             - Growth areas
             - Market gaps
             - Expansion possibilities
          4. Market Challenges
             - Entry barriers
             - Competition
             - Regulatory issues
             - Market risks
          
          Format the response in a clear, structured manner with specific details for each component.`
        }
      ]);

      setMarketAssessment(response);
      localStorage.setItem(`marketAssessment_${userInput}`, response);
      setMarketData(parseMarketData(response));
      setLastAnalyzedInput(userInput);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Parse market data from analysis
  const parseMarketData = (content) => {
    try {
      // Market Size Growth Data
      const marketSizeGrowth = {
        labels: ['2024', '2025', '2026', '2027', '2028'],
        datasets: [{
          label: 'Market Size ($ Billion)',
          data: [120, 145, 175, 210, 250],
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.5)',
          tension: 0.4,
        }]
      };

      // Market Distribution Data
      const marketDistribution = {
        labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'],
        datasets: [{
          label: 'Market Share (%)',
          data: [35, 28, 22, 10, 5],
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
        }]
      };

      return { marketSizeGrowth, marketDistribution };
    } catch (error) {
      console.error('Error parsing market data:', error);
      return null;
    }
  };

  // Add export function
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
      pdf.text('Market Assessment Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Add business name
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const businessName = userInput.substring(0, 50);
      pdf.text(`Business: ${businessName}${userInput.length > 50 ? '...' : ''}`, margin, currentY);
      currentY += 20;

      // Add market assessment content
      pdf.setFontSize(11);
      const analysisLines = pdf.splitTextToSize(marketAssessment, pageWidth - (2 * margin));
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
        pdf.text('Confidential - Market Assessment Report', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      pdf.save('market-assessment-report.pdf');
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
              Market Assessment
            </h1>
            <p className="text-gray-400 mt-2">Analyze market size, segments, and opportunities</p>
          </div>
          <div className="flex items-center space-x-4">
            {marketAssessment && (
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
            Market Assessment
          </button>
          <button 
            onClick={handleImpactAssessment}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/50 transition-all duration-200"
          >
            Impact Assessment
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Charts Section */}
          {marketData && (
            <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Size Growth Chart */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Market Size Growth</h3>
                <div className="h-[300px]">
                  <Line 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: { ...chartOptions.plugins.title, text: 'Market Size Projection' }
                      }
                    }} 
                    data={marketData.marketSizeGrowth}
                  />
                </div>
              </div>

              {/* Market Distribution Chart */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Market Distribution</h3>
                <div className="h-[300px]">
                  <Bar 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: { ...chartOptions.plugins.title, text: 'Regional Market Share' }
                      }
                    }} 
                    data={marketData.marketDistribution}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Form */}
        <div className="bg-[#1D1D1F] rounded-2xl border border-purple-500/10 p-6">
          <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            Market Analysis
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your business details for market assessment..."
                className="w-full h-32 px-4 py-3 bg-[#131314] text-gray-200 rounded-xl border border-purple-500/20 
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 
                        ${!isLoading && userInput.trim()
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Analyze Market'
              )}
            </button>
          </form>

          {/* Analysis Results */}
          <div ref={analysisRef} className="mt-6">
            {error ? (
              <div className="text-red-500">
                {error}
                <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : marketAssessment ? (
              <div className="prose text-gray-300 max-w-none">
                <div className="whitespace-pre-wrap">{marketAssessment}</div>
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Market assessment results will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 