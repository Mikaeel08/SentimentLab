import React from 'react';
import { 
  BarChart3, 
  FileText, 
  History, 
  Settings, 
  TrendingUp,
  Upload,
  Brain,
  Home,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  resultCount: number;
  batchCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  resultCount, 
  batchCount 
}) => {
  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      description: 'Welcome & overview'
    },
    {
      id: 'analyze',
      label: 'Text Analysis',
      icon: Brain,
      description: 'Analyze sentiment in text'
    },
    {
      id: 'batch',
      label: 'Batch Processing',
      icon: Upload,
      description: 'Process multiple texts',
      badge: batchCount > 0 ? batchCount : undefined
    },
    {
      id: 'dashboard',
      label: 'Analytics Dashboard',
      icon: BarChart3,
      description: 'View insights and trends',
      badge: resultCount > 0 ? resultCount : undefined
    },
    {
      id: 'history',
      label: 'Analysis History',
      icon: History,
      description: 'View past results'
    },
    {
      id: 'compare',
      label: 'Comparative Analysis',
      icon: TrendingUp,
      description: 'Compare different texts'
    },
    {
      id: 'export',
      label: 'Export & Reports',
      icon: FileText,
      description: 'Generate reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configure API and preferences'
    }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SentimentLab</h1>
            <p className="text-sm text-gray-500">AI-Powered Text Analysis</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm border border-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {resultCount} analyses completed
              </p>
              <p className="text-xs text-gray-500">
                Ready for insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};