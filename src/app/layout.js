"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#131314]`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-h-screen bg-[#131314] p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 