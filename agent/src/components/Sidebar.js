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
    <div style={{ width: '256px', minHeight: '100vh', background: 'linear-gradient(to bottom, #1D1D1F, #131314)', color: 'white', padding: '24px', borderRight: '1px solid #1D1D1F', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
      {/* Search Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="search"
            placeholder="Search..."
            style={{ width: '100%', background: '#1D1D1F', color: '#D1D5DB', borderRadius: '12px', paddingLeft: '16px', paddingRight: '32px', paddingTop: '10px', paddingBottom: '10px', fontSize: '14px', outline: 'none', border: 'none' }}
          />
          <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#9CA3AF' }}>🔍</span>
        </div>
      </div>

      {/* Navigation Sections */}
      {menuItems.map((section, index) => (
        <div key={index} style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '8px', paddingLeft: '8px', paddingRight: '8px' }}>
            {section.title}
          </h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {section.items.map((item, itemIndex) => (
              <Link
                key={itemIndex}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  backgroundColor: pathname === item.path ? '#6B46C1' : 'transparent',
                  color: pathname === item.path ? 'white' : '#9CA3AF',
                  textDecoration: 'none'
                }}
              >
                <span style={{ fontSize: '24px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      ))}

      {/* User Profile */}
    
    </div>
  );
} 