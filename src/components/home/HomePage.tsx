import React from 'react';
import { Brain, BarChart3, Upload, TrendingUp, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning models analyze sentiment with high accuracy and confidence scoring.',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Upload,
      title: 'Batch Processing',
      description: 'Process multiple texts simultaneously with CSV upload support and real-time progress tracking.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: BarChart3,
      title: 'Rich Analytics',
      description: 'Interactive dashboards with trend analysis, sentiment distribution, and comparative insights.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: TrendingUp,
      title: 'Comparative Analysis',
      description: 'Compare sentiment across different texts with side-by-side visualizations and insights.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Get instant results with live feedback and processing status for all your analyses.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data stays private with local storage and secure API connections to Hugging Face.',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const useCases = [
    {
      title: 'Customer Feedback',
      description: 'Analyze customer reviews and feedback to understand satisfaction levels and identify improvement areas.',
      icon: '💬'
    },
    {
      title: 'Social Media Monitoring',
      description: 'Track brand sentiment across social platforms and respond to customer concerns proactively.',
      icon: '📱'
    },
    {
      title: 'Product Reviews',
      description: 'Understand what customers love or dislike about your products through review sentiment analysis.',
      icon: '⭐'
    },
    {
      title: 'Market Research',
      description: 'Analyze survey responses and market feedback to guide business decisions and strategy.',
      icon: '📊'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              SentimentLab
            </h1>
            <p className="text-xl text-gray-600 mt-2">AI-Powered Text Analysis Platform</p>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Understand the <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">emotional tone</span> of any text
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Transform your text data into actionable insights with our advanced sentiment analysis platform. 
            Powered by state-of-the-art AI models, get instant sentiment classification, confidence scores, 
            and detailed analytics for better decision making.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('analyze')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Brain className="w-5 h-5" />
              <span>Start Analyzing</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to analyze sentiment and gain insights from your text data
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 group">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Perfect for Every Use Case</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From customer feedback to market research, our platform adapts to your needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{useCase.icon}</div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              99.2%
            </div>
            <div className="text-gray-600">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              &lt;2s
            </div>
            <div className="text-gray-600">Processing Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              100+
            </div>
            <div className="text-gray-600">Languages Supported</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-white">
        <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
        <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
          Join thousands of businesses using SentimentLab to understand their customers better 
          and make data-driven decisions.
        </p>
        <button
          onClick={() => onNavigate('analyze')}
          className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 inline-flex items-center space-x-2"
        >
          <Brain className="w-5 h-5" />
          <span>Start Your First Analysis</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};