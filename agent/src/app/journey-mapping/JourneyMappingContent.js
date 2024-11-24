"use client";

import { useState, useEffect, useRef } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { callGroqApi } from '@/utils/groqApi';
import ChatDialog from '@/components/ChatDialog';
import jsPDF from 'jspdf';

export default function JourneyMappingContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [journeyMapping, setJourneyMapping] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');

  const analysisRef = useRef(null);

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      pdf.setFontSize(20);
      pdf.setTextColor(0, 102, 204);
      pdf.text('Customer Journey Mapping Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const businessName = userInput.substring(0, 50);
      pdf.text(`Business: ${businessName}${userInput.length > 50 ? '...' : ''}`, margin, currentY);
      currentY += 20;

      pdf.setFontSize(11);
      const fullContent = journeyMapping || 'No analysis available.';
      const contentLines = pdf.splitTextToSize(fullContent, pageWidth - (2 * margin));

      for (const line of contentLines) {
        if (currentY + 10 > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += 10;
      }

      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        pdf.text('Confidential - Customer Journey Analysis', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      pdf.save('customer-journey-analysis.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  // Load stored analysis on mount and when userInput changes
  useEffect(() => {
    setMounted(true);
    const storedAnalysis = localStorage.getItem(`journeyMapping_${userInput}`);
    
    if (storedAnalysis) {
      setJourneyMapping(storedAnalysis);
      setLastAnalyzedInput(userInput);
    } else {
      setJourneyMapping('');
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
    const storedAnalysis = localStorage.getItem(`journeyMapping_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setJourneyMapping(storedAnalysis);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are a customer journey mapping expert. Create a detailed journey map analysis that covers all key touchpoints and interactions. Focus on providing specific, actionable insights about the customer journey.`
        },
        {
          role: "user",
          content: `Create a detailed customer journey map for this business: ${userInput}. 
          Please analyze and provide:
          1. Pre-Purchase Journey
          2. Purchase Experience
          3. Post-Purchase Journey
          4. Journey Optimization
          
          Format the response in a clear, structured manner with specific details for each stage of the journey.`
        }
      ]);

      setJourneyMapping(response);
      localStorage.setItem(`journeyMapping_${userInput}`, response);
      setLastAnalyzedInput(userInput);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Customer Journey Mapping
          </h1>
          <div className="absolute right-0 top-0 flex space-x-2">
            {journeyMapping && (
              <button
                onClick={exportToPDF}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Export PDF</span>
              </button>
            )}
            <ChatDialog currentPage="journeyMapping" />
          </div>
        </header>

        {/* Input Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="mb-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your business details for journey mapping..."
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
              {isLoading ? 'Analyzing...' : 'Create Journey Map'}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-1 gap-6">
          {/* Journey Mapping Box */}
          <div ref={analysisRef} className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">🗺️</span> Journey Mapping
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
              ) : journeyMapping ? (
                <div className="prose text-black whitespace-pre-wrap">{journeyMapping}</div>
              ) : (
                <div className="text-gray-500 italic">
                  Journey mapping results will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 