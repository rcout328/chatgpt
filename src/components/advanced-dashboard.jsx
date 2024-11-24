"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';
import { useStoredInput } from '@/hooks/useStoredInput';

export default function AdvancedDashboard() {
  const [userInput, setUserInput] = useStoredInput();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const analysisTools = [
    {
      id: 'market-trends',
      name: 'Market Trends',
      icon: '📊',
      description: 'Analyze market trends, size, and growth potential',
      path: '/market-trends',
      color: 'bg-blue-100'
    },
    {
      id: 'competitor-tracking',
      name: 'Competitor Analysis',
      icon: '🎯',
      description: 'Track and analyze competitor strategies',
      path: '/competitor-tracking',
      color: 'bg-green-100'
    },
    {
      id: 'swot-analysis',
      name: 'SWOT Analysis',
      icon: '⚖️',
      description: 'Identify strengths, weaknesses, opportunities, and threats',
      path: '/swot-analysis',
      color: 'bg-yellow-100'
    },
    {
      id: 'feature-priority',
      name: 'Feature Priority',
      icon: '⭐',
      description: 'Prioritize features and development roadmap',
      path: '/feature-priority',
      color: 'bg-purple-100'
    },
    {
      id: 'compliance-check',
      name: 'Compliance Check',
      icon: '📋',
      description: 'Ensure regulatory compliance and risk assessment',
      path: '/compliance-check',
      color: 'bg-red-100'
    },
    {
      id: 'impact-assessment',
      name: 'Impact Assessment',
      icon: '⚡',
      description: 'Evaluate business impact and sustainability',
      path: '/impact-assessment',
      color: 'bg-indigo-100'
    },
    {
      id: 'journey-mapping',
      name: 'Journey Mapping',
      icon: '🗺️',
      description: 'Map customer journeys and touchpoints',
      path: '/journey-mapping',
      color: 'bg-orange-100'
    },
    {
      id: 'gap-analysis',
      name: 'Gap Analysis',
      icon: '🔍',
      description: 'Identify and analyze business gaps',
      path: '/gap-analysis',
      color: 'bg-teal-100'
    }
  ];

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

  const navigateToTool = (path) => {
    if (userInput.trim()) {
      router.push(path);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6 bg-white shadow-lg rounded-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Business Analysis Dashboard
          </h1>
          <p className="text-gray-600">
            Enter your business details once to analyze across all tools
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
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
            <Button
              type="submit"
              disabled={isSubmitting || !userInput.trim()}
              className="w-full"
            >
              {isSubmitting ? 'Starting Analysis...' : 'Start Analysis'}
            </Button>
          </div>
        </form>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Analysis Tools
          </h2>
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisTools.map((tool) => (
                <Tooltip key={tool.id} content={tool.description}>
                  <Card
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${tool.color} ${
                      !userInput.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => navigateToTool(tool.path)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
} 