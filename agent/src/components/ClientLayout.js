"use client";

import { BusinessProvider } from '../context/BusinessContext';
import Navigation from './Navigation';

export default function ClientLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Market Insight Analysis
        </h1>
      </header>
      <Navigation />
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
  );
} 