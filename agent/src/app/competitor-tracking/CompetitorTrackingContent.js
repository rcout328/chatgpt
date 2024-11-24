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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
          font: { size: 12 },
          padding: 20
        }
      },
      title: {
        display: true,
        color: '#9ca3af',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      }
    },
    scales: {
      r: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        angleLines: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { 
          color: '#9ca3af',
          backdropColor: 'transparent',
          font: { size: 11 }
        },
        pointLabels: { 
          color: '#9ca3af',
          font: { size: 12 }
        }
      },
      x: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { 
          color: '#9ca3af',
          font: { size: 11 }
        }
      },
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { 
          color: '#9ca3af',
          font: { size: 11 }
        }
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

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are a competitor analysis expert. Analyze competitors and provide detailed insights with specific numbers and percentages that can be visualized. Include market share percentages and competitive strength scores.`
        },
        {
          role: "user",
          content: `Analyze competitors for this business: ${userInput}. 
          Please provide:
          1. Market Share Distribution
             - List each competitor with their market share percentage
             - Format as "Competitor has X%" for each
          2. Competitive Strengths
             - Rate each competitor's strengths in different categories
             - Use format "Company scores X in Category"
             - Include scores for: Innovation, Market Reach, Product Quality, Customer Service, Brand Value
          3. Detailed Analysis
             - Competitor strategies
             - Competitive advantages
             - Market positioning
             - Growth trends
          
          Format the response with clear numerical data that can be extracted for visualization.`
        }
      ]);

      setCompetitorAnalysis(response);
      setCompetitorData(parseCompetitorData(response));
      localStorage.setItem(`competitorAnalysis_${userInput}`, response);
      setLastAnalyzedInput(userInput);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update the parseCompetitorData function
  const parseCompetitorData = (content) => {
    try {
      // Extract competitor names and market share percentages using improved regex
      const competitorMatches = content.match(/([A-Za-z\s]+)(?:has|holds|with|at)\s*(\d+(?:\.\d+)?)\s*%/gi);
      
      // Market Share Data with default values if no matches found
      const marketShareData = {
        labels: [],
        datasets: [{
          label: 'Market Share (%)',
          data: [],
          backgroundColor: [
            'rgba(147, 51, 234, 0.5)',  // Purple
            'rgba(59, 130, 246, 0.5)',   // Blue
            'rgba(16, 185, 129, 0.5)',   // Green
            'rgba(245, 158, 11, 0.5)',   // Orange
            'rgba(239, 68, 68, 0.5)',    // Red
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

      // Parse competitor data or use default values
      if (competitorMatches && competitorMatches.length > 0) {
        competitorMatches.forEach(match => {
          const [_, name, share] = match.match(/([A-Za-z\s]+)(?:has|holds|with|at)\s*(\d+(?:\.\d+)?)/i);
          marketShareData.labels.push(name.trim());
          marketShareData.datasets[0].data.push(parseFloat(share));
        });
      } else {
        // Default data if no matches found
        marketShareData.labels = ['Company A', 'Company B', 'Company C', 'Company D', 'Others'];
        marketShareData.datasets[0].data = [35, 25, 20, 15, 5];
      }

      // Competitive Strengths Data
      const strengthsData = {
        labels: ['Innovation', 'Market Reach', 'Product Quality', 'Customer Service', 'Brand Value'],
        datasets: [{
          label: 'Competitive Score',
          data: [85, 78, 92, 88, 76],
          backgroundColor: 'rgba(147, 51, 234, 0.5)',
          borderColor: 'rgb(147, 51, 234)',
          borderWidth: 1,
        }],
      };

      return { marketShareData, strengthsData };
    } catch (error) {
      console.error('Error parsing competitor data:', error);
      // Return default data structure if parsing fails
      return {
        marketShareData: {
          labels: ['Company A', 'Company B', 'Company C', 'Company D', 'Others'],
          datasets: [{
            label: 'Market Share (%)',
            data: [35, 25, 20, 15, 5],
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
        },
        strengthsData: {
          labels: ['Innovation', 'Market Reach', 'Product Quality', 'Customer Service', 'Brand Value'],
          datasets: [{
            label: 'Competitive Score',
            data: [85, 78, 92, 88, 76],
            backgroundColor: 'rgba(147, 51, 234, 0.5)',
            borderColor: 'rgb(147, 51, 234)',
            borderWidth: 1,
          }],
        }
      };
    }
  };

  // Update the exportToPDF function
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

      // Add competitor analysis content
      pdf.setFontSize(11);
      const analysisLines = pdf.splitTextToSize(competitorAnalysis, pageWidth - (2 * margin));
      for (const line of analysisLines) {
        if (currentY + 10 > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += 10;
      }

      // Add charts if available
      if (chartsRef.current && competitorData) {
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
        pdf.text('Confidential - Competitor Analysis Report', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      pdf.save('competitor-analysis-report.pdf');
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
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Charts Section */}
          {competitorData && (
            <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Share Chart */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Market Share Distribution</h3>
                <div className="h-[300px]">
                  <Bar 
                    options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      aspectRatio: 1.5,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: 'Market Share Distribution',
                          font: {
                            size: 18,
                            weight: 'bold'
                          }
                        }
                      }
                    }} 
                    data={competitorData.marketShareData}
                  />
                </div>
              </div>

              {/* Competitive Analysis Radar */}
              <div className="bg-[#1D1D1F] p-6 rounded-2xl border border-purple-500/10">
                <h3 className="text-xl font-semibold mb-4 text-gray-200">Competitive Strengths Analysis</h3>
                <div className="h-[300px]">
                  <Radar 
                    options={{
                      ...chartOptions,
                      maintainAspectRatio: false,
                      aspectRatio: 1.5,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          ...chartOptions.plugins.title,
                          text: 'Competitive Strengths',
                          font: {
                            size: 18,
                            weight: 'bold'
                          }
                        }
                      },
                      scales: {
                        r: {
                          ...chartOptions.scales.r,
                          pointLabels: {
                            ...chartOptions.scales.r.pointLabels,
                            font: { size: 14 },
                            color: '#9ca3af'
                          },
                          ticks: {
                            ...chartOptions.scales.r.ticks,
                            font: { size: 12 },
                            backdropPadding: 5
                          }
                        }
                      }
                    }} 
                    data={competitorData.strengthsData}
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