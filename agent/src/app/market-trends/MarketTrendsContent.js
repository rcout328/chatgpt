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

export default function MarketTrendsContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [marketAnalysis, setMarketAnalysis] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');
  const router = useRouter();

  // Add refs for the content we want to export
  const chartsRef = useRef(null);
  const analysisRef = useRef(null);

  // Updated chart options with dark theme
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9ca3af',
          font: {
            size: 12
          }
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
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  // Parse market data from GROQ response
  const parseMarketData = (content) => {
    try {
      // Extract growth rates and market segments from the analysis text
      const growthRateMatch = content.match(/growth rate[s]?\s*(?:of|:)?\s*(\d+(?:\.\d+)?)/i);
      const segmentMatches = content.match(/(\w+)\s*segment[s]?\s*(?::|accounts for|represents)?\s*(\d+(?:\.\d+)?)\s*%/gi);

      const monthlyGrowth = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Market Growth (%)',
          data: Array(12).fill().map(() => 
            parseFloat(growthRateMatch?.[1] || 0) + (Math.random() * 2 - 1)
          ),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4,
        }],
      };

      const segments = segmentMatches ? segmentMatches.map(match => {
        const [segment, percentage] = match.match(/(\w+)\s*segment[s]?\s*(?::|accounts for|represents)?\s*(\d+(?:\.\d+)?)/i).slice(1);
        return { segment, percentage: parseFloat(percentage) };
      }) : [
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

      return { monthlyGrowth, marketSegments };
    } catch (error) {
      console.error('Error parsing market data:', error);
      return null;
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
    const storedAnalysis = localStorage.getItem(`marketAnalysis_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setMarketAnalysis(storedAnalysis);
      setMarketData(parseMarketData(storedAnalysis));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are a market analysis expert. Analyze market trends and provide detailed insights with specific numbers and percentages that can be visualized. Focus on providing clear, quantifiable data points for market segments and growth rates.`
        },
        {
          role: "user",
          content: `Analyze market trends for this business: ${userInput}. 
          Please provide a detailed analysis covering:
          1. Market Trends
             - Current market dynamics
             - Growth rates with specific percentages
             - Market segments with share percentages
             - Industry-specific developments
          2. Market Size
             - Total addressable market size
             - Market growth rate
             - Market segments distribution
             - Geographic distribution
          3. Target Audience
             - Customer demographics
             - Customer needs and preferences
             - Market penetration opportunities
             - Customer acquisition channels
             
          Important: Include specific percentages for market segments and growth rates that can be used for visualization.`
        }
      ]);

      setMarketAnalysis(response);
      const parsedData = parseMarketData(response);
      setMarketData(parsedData);
      localStorage.setItem(`marketAnalysis_${userInput}`, response);
      setLastAnalyzedInput(userInput);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add export function
  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204);
      pdf.text('Market Trends Analysis Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Add business name without timestamp
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const businessName = userInput.substring(0, 50);
      pdf.text(`Business: ${businessName}${userInput.length > 50 ? '...' : ''}`, margin, currentY);
      currentY += 20;

      // Add initial summary
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('1. Executive Summary', margin, currentY);
      pdf.setFont(undefined, 'normal');
      currentY += 10;

      // Initial summary section
      pdf.setFontSize(11);
      const initialSummaryText = "This report provides a comprehensive analysis of market trends, including growth patterns, market segments, and key insights derived from the data.";
      const initialSummaryLines = pdf.splitTextToSize(initialSummaryText, pageWidth - (2 * margin));
      pdf.text(initialSummaryLines, margin, currentY);
      currentY += (initialSummaryLines.length * 7) + 10;

      // Add detailed summary section
      currentY = addSectionTitle(pdf, '2. Detailed Analysis', currentY);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const detailedSummaryText = marketAnalysis || "Detailed market analysis and insights will be provided here.";
      const detailedSummaryLines = pdf.splitTextToSize(detailedSummaryText, pageWidth - (2 * margin));
      pdf.text(detailedSummaryLines, margin, currentY + 5);
      currentY += detailedSummaryLines.length * 5 + 10;

      // Rest of your PDF generation code...
      // Add market visualization section
      if (chartsRef.current && marketData) {
        currentY = addSectionTitle(pdf, '3. Market Visualizations', currentY);
        const chartsCanvas = await html2canvas(chartsRef.current);
        const chartsImage = chartsCanvas.toDataURL('image/png');
        const chartsAspectRatio = chartsCanvas.width / chartsCanvas.height;
        const chartsWidth = pageWidth - (2 * margin);
        const chartsHeight = chartsWidth / chartsAspectRatio;

        // Check if we need a new page for charts
        if (currentY + chartsHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(chartsImage, 'PNG', margin, currentY, chartsWidth, chartsHeight);
        currentY += chartsHeight + 15;
      }

      // Add recommendations section
      if (currentY + 40 > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      currentY = addSectionTitle(pdf, '4. Recommendations', currentY);
      const recommendationsText = "Based on the analysis, we recommend focusing on the identified growth opportunities and addressing potential market challenges.";
      const recommendationLines = pdf.splitTextToSize(recommendationsText, pageWidth - (2 * margin));
      pdf.text(recommendationLines, margin, currentY + 5);

      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        // Add page numbers
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        // Add confidentiality notice
        pdf.text('Confidential - Market Insight Analysis', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      pdf.save('market-trends-analysis.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  // Add function to handle competitor tracking navigation
  const handleCompetitorTracking = () => {
    router.push('/competitor-tracking');
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

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

        {/* Tabs */}
        <div className="bg-[#1D1D1F] p-1 rounded-xl mb-8 inline-flex">
          <button className="px-4 py-2 rounded-lg bg-purple-600 text-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Charts Section */}
          {marketData && (
            <>
              {/* Growth Trend Chart */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Growth Trend</h3>
                <div className="h-[300px]">
                  <Line 
                    options={{
                      ...chartOptions,
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
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Market Segments</h3>
                <div className="h-[300px]">
                  <Bar 
                    options={{
                      ...chartOptions,
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
            </>
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
                placeholder="Enter your business details for market analysis..."
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
          <div className="mt-6">
            {error ? (
              <div className="text-red-500">
                {error}
                <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
              </div>
            ) : marketAnalysis ? (
              <div className="prose text-gray-300 max-w-none">
                <div className="whitespace-pre-wrap">{marketAnalysis}</div>
              </div>
            ) : !isLoading && (
              <div className="text-gray-500 italic">
                Market analysis results will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}