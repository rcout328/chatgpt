"use client";

import { useState, useEffect, useRef } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { callGroqApi } from '@/utils/groqApi';
import { useRouter } from 'next/navigation';
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
      r: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        angleLines: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { 
          color: '#9ca3af',
          backdropColor: 'transparent'
        },
        pointLabels: { color: '#9ca3af' }
      },
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

  // Handle navigation to Market Trends
  const handleMarketTrends = () => {
    router.push('/market-trends');
  };

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

  // Add PDF generation function
  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204);
      pdf.text('Competitor Analysis Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Add business name
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const businessName = userInput.substring(0, 50);
      pdf.text(`Business: ${businessName}${userInput.length > 50 ? '...' : ''}`, margin, currentY);
      currentY += 20;

      // Add executive summary
      currentY = addSectionTitle(pdf, '1. Executive Summary', currentY);
      pdf.setFontSize(11);
      const summaryText = "This report provides a comprehensive analysis of your competitors, including market share distribution, competitive positioning, and strategic insights.";
      const summaryLines = pdf.splitTextToSize(summaryText, pageWidth - (2 * margin));
      pdf.text(summaryLines, margin, currentY);
      currentY += (summaryLines.length * 7) + 10;

      // Add competitor analysis section
      currentY = addSectionTitle(pdf, '2. Detailed Competitor Analysis', currentY);
      if (competitorAnalysis) {
        pdf.setFontSize(10);
        const analysisLines = pdf.splitTextToSize(competitorAnalysis, pageWidth - (2 * margin));
        
        // Check if we need a new page
        if (currentY + (analysisLines.length * 5) > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.text(analysisLines, margin, currentY);
        currentY += analysisLines.length * 5 + 15;
      }

      // Add market share visualization
      if (chartsRef.current && competitorData) {
        if (currentY + 100 > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        currentY = addSectionTitle(pdf, '3. Market Share Visualization', currentY);
        const chartsCanvas = await html2canvas(chartsRef.current);
        const chartsImage = chartsCanvas.toDataURL('image/png');
        const chartsAspectRatio = chartsCanvas.width / chartsCanvas.height;
        const chartsWidth = pageWidth - (2 * margin);
        const chartsHeight = chartsWidth / chartsAspectRatio;

        pdf.addImage(chartsImage, 'PNG', margin, currentY + 5, chartsWidth, chartsHeight);
        currentY += chartsHeight + 15;
      }

      // Add recommendations section
      if (currentY + 40 > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      currentY = addSectionTitle(pdf, '4. Strategic Recommendations', currentY);
      const recommendationsText = "Based on the competitive analysis, we recommend focusing on differentiating factors and addressing identified market gaps to strengthen your competitive position.";
      const recLines = pdf.splitTextToSize(recommendationsText, pageWidth - (2 * margin));
      pdf.text(recLines, margin, currentY + 5);

      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        pdf.text('Confidential - Competitor Analysis Report', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      pdf.save('competitor_analysis_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  // Add this function after parseCompetitorData
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
      pdf.text('Competitor Analysis Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Add business name
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const businessName = userInput.substring(0, 50);
      pdf.text(`Business: ${businessName}${userInput.length > 50 ? '...' : ''}`, margin, currentY);
      currentY += 20;

      // Add executive summary
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('1. Executive Summary', margin, currentY);
      pdf.setFont(undefined, 'normal');
      currentY += 10;

      pdf.setFontSize(11);
      const summaryText = "This report provides a comprehensive analysis of your competitors, including market share distribution, competitive positioning, and strategic insights.";
      const summaryLines = pdf.splitTextToSize(summaryText, pageWidth - (2 * margin));
      pdf.text(summaryLines, margin, currentY);
      currentY += (summaryLines.length * 7) + 10;

      // Add competitor analysis section
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('2. Detailed Competitor Analysis', margin, currentY);
      pdf.setFont(undefined, 'normal');
      currentY += 10;

      if (competitorAnalysis) {
        pdf.setFontSize(10);
        const analysisLines = pdf.splitTextToSize(competitorAnalysis, pageWidth - (2 * margin));
        
        // Check if we need a new page
        if (currentY + (analysisLines.length * 5) > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.text(analysisLines, margin, currentY);
        currentY += analysisLines.length * 5 + 15;
      }

      // Add market share visualization
      if (chartsRef.current && competitorData) {
        if (currentY + 100 > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('3. Market Share Visualization', margin, currentY);
        pdf.setFont(undefined, 'normal');
        currentY += 10;

        const chartsCanvas = await html2canvas(chartsRef.current);
        const chartsImage = chartsCanvas.toDataURL('image/png');
        const chartsAspectRatio = chartsCanvas.width / chartsCanvas.height;
        const chartsWidth = pageWidth - (2 * margin);
        const chartsHeight = chartsWidth / chartsAspectRatio;

        pdf.addImage(chartsImage, 'PNG', margin, currentY + 5, chartsWidth, chartsHeight);
        currentY += chartsHeight + 15;
      }

      // Add recommendations section
      if (currentY + 40 > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('4. Strategic Recommendations', margin, currentY);
      pdf.setFont(undefined, 'normal');
      currentY += 10;

      const recommendationsText = "Based on the competitive analysis, we recommend focusing on differentiating factors and addressing identified market gaps to strengthen your competitive position.";
      const recLines = pdf.splitTextToSize(recommendationsText, pageWidth - (2 * margin));
      pdf.text(recLines, margin, currentY + 5);

      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        pdf.text('Confidential - Competitor Analysis Report', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      pdf.save('competitor_analysis_report.pdf');
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
    <div className="min-h-screen bg-[#131314] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Competitor Analysis
            </h1>
            <p className="text-gray-400 mt-2">Track and analyze your competitors</p>
          </div>
          <div className="flex items-center space-x-4">
            {competitorAnalysis && (
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
          <button 
            onClick={handleMarketTrends}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/50 transition-all duration-200"
          >
            Market Trends
          </button>
          <button className="px-4 py-2 rounded-lg bg-purple-600 text-white">
            Competitor Tracking
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Charts Section */}
          {competitorData && (
            <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Share Chart */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Market Share</h3>
                <div className="h-[300px]">
                  <Bar 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: { ...chartOptions.plugins.title, text: 'Market Share Distribution' }
                      }
                    }} 
                    data={competitorData}
                  />
                </div>
              </div>

              {/* Competitive Analysis Radar */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Competitive Analysis</h3>
                <div className="h-[300px]">
                  <Radar 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: { ...chartOptions.plugins.title, text: 'Competitive Strengths' }
                      }
                    }} 
                    data={competitorData}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Form */}
        <div className="bg-[#1D1D1F] rounded-2xl border border-purple-500/10 p-6">
          <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            Competitor Analysis
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your business details for competitor analysis..."
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
                'Analyze Competitors'
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
            ) : competitorAnalysis ? (
              <div className="prose text-gray-300 max-w-none">
                <div className="whitespace-pre-wrap">{competitorAnalysis}</div>
              </div>
            ) : !isLoading && (
              <div className="text-gray-500 italic">
                Competitor analysis results will appear here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}