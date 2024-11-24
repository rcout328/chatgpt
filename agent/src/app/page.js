"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStoredInput } from '@/hooks/useStoredInput';
import StartupChatbot from '@/components/StartupChatbot';

export default function Home() {
  const [userInput, setUserInput] = useStoredInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Add storage event listener
    const handleStorageChange = () => {
      const storedInput = localStorage.getItem('businessInput');
      if (storedInput) {
        setUserInput(storedInput);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for stored input on mount
  useEffect(() => {
    const storedInput = localStorage.getItem('businessInput');
    if (storedInput) {
      setUserInput(storedInput);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      localStorage.setItem('businessInput', userInput);
      router.push('/market-trends');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseChatbot = () => {
    setShowChatbot(false);
    // Trigger storage event to update input
    window.dispatchEvent(new Event('storage'));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#131314] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Market Insight Analysis
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Unlock powerful market insights with our AI-driven analysis platform
          </p>
        </div>

        {/* Main Content */}
        <div className="flex justify-center items-center">
          {showChatbot ? (
            <StartupChatbot 
              onClose={handleCloseChatbot} 
              setUserInput={setUserInput}
            />
          ) : (
            /* Input Form with Glass Effect */
            <div className="w-full max-w-2xl bg-gradient-to-b from-purple-500/10 to-transparent p-[1px] rounded-2xl backdrop-blur-xl">
              <div className="bg-[#1D1D1F]/90 p-8 rounded-2xl backdrop-blur-xl">
                <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  Begin Your Analysis Journey
                </h2>
                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => setShowChatbot(true)}
                    className="w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 
                             bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 
                             hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 
                             flex items-center justify-center space-x-2"
                  >
                    <span>🤖</span>
                    <span>Chat with AI Assistant</span>
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur"></div>
                    <div className="relative">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Or describe your business manually
                          </label>
                          <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Describe your business, products/services, target market, and business model..."
                            className="w-full h-40 px-4 py-3 bg-[#131314] text-gray-200 rounded-xl border border-purple-500/20 
                                     placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                            disabled={isSubmitting}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting || !userInput.trim()}
                          className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 
                                    ${!isSubmitting && userInput.trim()
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25'
                              : 'bg-gray-600 text-gray-300 cursor-not-allowed'}`}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </div>
                          ) : (
                            'Start Analysis'
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-8 pt-6 border-t border-purple-500/10">
                  <p className="text-sm text-purple-400 mb-3">Pro Tips:</p>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-500">•</span>
                      <span>Chat with AI for guided analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-500">•</span>
                      <span>Be specific about your target market</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-500">•</span>
                      <span>Describe your business model clearly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}