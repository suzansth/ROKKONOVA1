import React from 'react';
import { Mountain, Home } from 'lucide-react';

interface HeaderProps {
  activeTab: 'traffic' | 'parking';
  onTabChange: (tab: 'traffic' | 'parking') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Mountain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ROKKONOVA</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => onTabChange('traffic')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'traffic'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                交通量データ
              </button>
              <button
                onClick={() => onTabChange('parking')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'parking'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                駐車場データ
              </button>
            </nav>
          </div>
          
          <div className="flex items-center">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <Home className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => onTabChange('traffic')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'traffic'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              交通量データ
            </button>
            <button
              onClick={() => onTabChange('parking')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'parking'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              駐車場データ
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;