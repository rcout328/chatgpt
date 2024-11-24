"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStoredInput } from '@/hooks/useStoredInput';
import StartupChatbot from '@/components/StartupChatbot';

export default function Dashboard() {
  const [userInput, setUserInput] = useStoredInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChatbotComplete = (description) => {
    setUserInput(description);
    setShowChatbot(false);
  };

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

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Business Analysis Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your business or chat with our AI to create a detailed description.
          </p>
        </header>

        {showChatbot ? (
          <StartupChatbot onComplete={handleChatbotComplete} />
        ) : (
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Details
                  </label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Describe your business, products/services, target market, and business model..."
                    className="w-full p-3 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowChatbot(true)}
                    className="flex-1 p-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Chat with AI
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !userInput.trim()}
                    className="flex-1 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Starting Analysis...' : 'Start Analysis'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}