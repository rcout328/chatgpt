"use client";

import { useState, useEffect, useRef } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { Line, Bar } from 'react-chartjs-2';
import { callGroqApi } from '@/utils/groqApi';
import ChatDialog from '@/components/ChatDialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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

// Add these helper functions at the top level
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const addPageHeader = (pdf, pageNumber, totalPages) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 20, 10, { align: 'right' });
  pdf.text(formatDate(new Date()), 10, 10);
};

const addSectionTitle = (pdf, title, yPosition) => {
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, 10, yPosition);
  pdf.setFont(undefined, 'normal');
  return yPosition + 10;
};

export default function MarketTrendsContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [marketAnalysis, setMarketAnalysis] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');

  // Add refs for the content we want to export
  const chartsRef = useRef(null);
  const analysisRef = useRef(null);

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Market Growth Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Growth Rate (%)',
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Market Segment Distribution',
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

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Market Trends Analysis
          </h1>
          <div className="absolute right-0 top-0 flex space-x-2">
            {marketData && (
              <button
                onClick={exportToPDF}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Export PDF</span>
              </button>
            )}
            <ChatDialog currentPage="marketTrends" />
          </div>
        </header>

        {/* Market Visualization Section */}
        {marketData && (
          <div ref={chartsRef} className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Growth Trend Chart */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="h-[400px]">
                <Line options={lineOptions} data={marketData.monthlyGrowth} />
              </div>
            </div>

            {/* Market Segments Chart */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="h-[400px]">
                <Bar options={barOptions} data={marketData.marketSegments} />
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="mb-8">
          {isLoading || !userInput.trim() ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="mb-4">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter your business details for market analysis..."
                  className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-none text-black"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="flex items-center">
                  <span className="mr-2">💡</span>
                  <strong>Pro Tip:</strong> After describing your business idea, you can chat with our AI assistant for a more detailed discussion. When you're done sharing all the details, simply type "end" in the chat to get a comprehensive summary.
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-4 rounded-lg font-medium transition-colors ${
                  !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Analyzing...' : 'Analyze Market'}
              </button>
            </form>
          )}
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">📊</span> Market Analysis
            </h2>
            <div ref={analysisRef} className="bg-gray-50 rounded-lg p-4 min-h-[300px]">
              {error ? (
                <div className="text-red-500">
                  {error}
                  <p className="text-sm mt-2">Please try refreshing the page or contact support if the problem persists.</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : marketAnalysis ? (
                <div className="prose text-black whitespace-pre-wrap">{marketAnalysis}</div>
              ) : (
                <div className="text-gray-500 italic">
                  Market analysis results will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}