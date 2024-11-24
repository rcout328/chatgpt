"use client";

import { useState, useEffect } from 'react';
import { useStoredInput } from '@/hooks/useStoredInput';
import { callGroqApi } from '@/utils/groqApi';
import ChatDialog from '@/components/ChatDialog';
import jsPDF from 'jspdf';

// Remove the helper function for PDF section titles
// const addSectionTitle = (pdf, title, yPosition) => {
//   pdf.setFontSize(14);
//   pdf.setTextColor(0, 0, 0);
//   pdf.setFont(undefined, 'bold');
//   pdf.text(title, 15, yPosition);
//   pdf.setFont(undefined, 'normal');
//   return yPosition + 10;
// };

export default function ComplianceCheckContent() {
  const [userInput, setUserInput] = useStoredInput();
  const [complianceAnalysis, setComplianceAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState('');

  // Load stored analysis on mount and when userInput changes
  useEffect(() => {
    setMounted(true);
    const storedAnalysis = localStorage.getItem(`complianceAnalysis_${userInput}`);
    
    if (storedAnalysis) {
      setComplianceAnalysis(storedAnalysis);
      setLastAnalyzedInput(userInput);
    } else {
      setComplianceAnalysis('');
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
    const storedAnalysis = localStorage.getItem(`complianceAnalysis_${userInput}`);
    if (storedAnalysis && userInput === lastAnalyzedInput) {
      setComplianceAnalysis(storedAnalysis);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: `You are a compliance analysis expert. Create a detailed compliance analysis that covers all key regulatory and operational requirements. Focus on providing specific, actionable insights about compliance needs and risk management.`
        },
        {
          role: "user",
          content: `Analyze compliance requirements for this business: ${userInput}. 
          Please provide:
          1. Regulatory Framework
             - Industry regulations
             - Legal requirements
             - Licensing needs
             - Reporting obligations
          2. Data Protection & Privacy
             - Privacy requirements
             - Data handling standards
             - Security protocols
             - User rights management
          3. Operational Compliance
             - Standard operating procedures
             - Quality control measures
             - Documentation requirements
             - Audit protocols
          4. Risk Management
             - Compliance risks
             - Mitigation strategies
             - Monitoring systems
             - Incident response plans
          
          Format the response in a clear, structured manner with specific details for each component.`
        }
      ]);

      setComplianceAnalysis(response);
      localStorage.setItem(`complianceAnalysis_${userInput}`, response);
      setLastAnalyzedInput(userInput);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get analysis. Please try again.');
    } finally {
      setIsLoading(false);
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
      pdf.text('Compliance Check Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Add business name
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const businessName = userInput.substring(0, 50);
      pdf.text(`Business: ${businessName}${userInput.length > 50 ? '...' : ''}`, margin, currentY);
      currentY += 20;

      // Add compliance analysis text without dividing into sections
      pdf.setFontSize(11);
      const analysisLines = pdf.splitTextToSize(complianceAnalysis, pageWidth - (2 * margin));
      for (const line of analysisLines) {
        if (currentY + 10 > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += 10;
      }

      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        pdf.text('Confidential - Compliance Check Report', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      pdf.save('compliance_check_report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Compliance Check Analysis
          </h1>
          <div className="absolute right-0 top-0 flex space-x-2">
            {complianceAnalysis && (
              <button
                onClick={generatePDF}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Export PDF</span>
              </button>
            )}
            <ChatDialog currentPage="complianceCheck" />
          </div>
        </header>

        {/* Input Form */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="mb-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your business details for compliance analysis..."
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
              {isLoading ? 'Analyzing...' : 'Analyze Compliance'}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        <div className="grid md:grid-cols-1 gap-6">
          {/* Compliance Analysis Box */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 flex items-center">
              <span className="mr-2">📋</span> Compliance Analysis
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
              ) : complianceAnalysis ? (
                <div className="prose text-black whitespace-pre-wrap">{complianceAnalysis}</div>
              ) : (
                <div className="text-gray-500 italic">
                  Compliance analysis results will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 