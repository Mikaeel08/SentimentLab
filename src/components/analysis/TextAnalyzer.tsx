import React, { useState } from 'react';
import { Brain, Loader2, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { SentimentResult } from '../../types/sentiment';

interface TextAnalyzerProps {
  onAnalyze: (text: string, useDemo?: boolean) => Promise<SentimentResult>;
  isLoading: boolean;
  error: string | null;
  hasApiKey: boolean;
}

export const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ 
  onAnalyze, 
  isLoading, 
  error,
  hasApiKey 
}) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    try {
      const analysisResult = await onAnalyze(text.trim(), !hasApiKey);
      setResult(analysisResult);
    } catch (error) {
      // Error handled by parent component
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Text Sentiment Analysis</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Analyze the emotional tone of any text using advanced AI. Get detailed insights about sentiment, 
          confidence levels, and key emotional indicators.
        </p>
      </div>

      {/* Demo Notice */}
      {!hasApiKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Demo Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You're using demo mode with simulated results. Add your Hugging Face API key in Settings for real-time analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter text to analyze
          </label>
          <div className="relative">
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here... (e.g., customer reviews, social media posts, feedback)"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-colors"
              disabled={isLoading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {text.length} characters
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Analyze Sentiment</span>
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Analysis Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Analysis Complete</span>
            </h3>
            <div className="text-sm text-gray-500">
              {result.timestamp.toLocaleString()}
            </div>
          </div>

          {/* Main Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className={`p-4 rounded-lg border-2 ${getSentimentColor(result.sentiment)}`}>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{getSentimentIcon(result.sentiment)}</span>
                <div>
                  <h4 className="font-semibold capitalize">{result.sentiment} Sentiment</h4>
                  <p className="text-sm opacity-80">
                    {(result.confidence * 100).toFixed(1)}% confidence
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Sentiment Breakdown</h4>
              {Object.entries(result.scores).map(([sentiment, score]) => (
                <div key={sentiment} className="flex items-center space-x-3">
                  <span className="w-20 text-sm capitalize text-gray-600">{sentiment}:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        sentiment === 'positive' ? 'bg-emerald-500' :
                        sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          {result.keywords.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Key Sentiment Indicators</h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(keyword.sentiment)}`}
                  >
                    {keyword.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          {result.explanation && (
            <div className="bg-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-emerald-900 mb-2">Analysis Explanation</h4>
              <p className="text-emerald-800 text-sm">{result.explanation}</p>
            </div>
          )}

          {/* Original Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Analyzed Text</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm leading-relaxed">{result.text}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};