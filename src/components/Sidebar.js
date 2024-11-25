"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'DASHBOARD',
      items: [
        { name: 'Home', icon: '🏠', path: '/' }
      ]
    },
    {
      title: 'MODULES',
      items: [
        { name: 'Market Analysis', icon: '📊', path: '/market-trends' },
        { name: 'Customer Discovery', icon: '👥', path: '/icp-creation' },
        { name: 'SWOT Analysis', icon: '⚖️', path: '/swot-analysis' },
        { name: 'Product Evolution', icon: '⭐', path: '/feature-priority' },
        { name: 'Market Expansion', icon: '📈', path: '/market-assessment' }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Talk to Agents', icon: '💬', path: '/chat' }
      ]
    }
  ];

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-[#1D1D1F] to-[#131314] text-white p-6 border-r border-[#1D1D1F] shadow-lg">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-[#1D1D1F] text-gray-300 rounded-xl pl-4 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-500">🔍</span>
        </div>
      </div>

      {/* Navigation Sections */}
      {menuItems.map((section, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-xs text-gray-400 font-semibold tracking-wider mb-2 px-2">
            {section.title}
          </h2>
          <nav className="space-y-1">
            {section.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  pathname === item.path
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-400 hover:bg-[#1D1D1F] hover:text-white'
                }`}
              >
                <span className="text-xl w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
} 