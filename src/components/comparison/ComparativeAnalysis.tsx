import React, { useState } from 'react';
import { TrendingUp, Plus, X, BarChart3 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { SentimentResult } from '../../types/sentiment';

interface ComparativeAnalysisProps {
  onAnalyze: (text: string, useDemo?: boolean) => Promise<SentimentResult>;
  hasApiKey: boolean;
}

export const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ 
  onAnalyze, 
  hasApiKey 
}) => {
  const [texts, setTexts] = useState<Array<{ id: string; text: string; label: string }>>([
    { id: '1', text: '', label: 'Text 1' },
    { id: '2', text: '', label: 'Text 2' }
  ]);
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTextInput = () => {
    const newId = Date.now().toString();
    setTexts([...texts, { id: newId, text: '', label: `Text ${texts.length + 1}` }]);
  };

  const removeTextInput = (id: string) => {
    if (texts.length > 2) {
      setTexts(texts.filter(t => t.id !== id));
    }
  };

  const updateText = (id: string, field: 'text' | 'label', value: string) => {
    setTexts(texts.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleCompare = async () => {
    const validTexts = texts.filter(t => t.text.trim());
    if (validTexts.length < 2) return;

    setIsLoading(true);
    setResults([]);

    try {
      const analysisPromises = validTexts.map(async (textItem) => {
        const result = await onAnalyze(textItem.text.trim(), !hasApiKey);
        return { ...result, customLabel: textItem.label };
      });

      const analysisResults = await Promise.all(analysisPromises);
      setResults(analysisResults);
    } catch (error) {
      console.error('Comparison analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getComparisonData = () => {
    return results.map((result, index) => ({
      name: (result as any).customLabel || `Text ${index + 1}`,
      positive: result.scores.positive * 100,
      negative: result.scores.negative * 100,
      neutral: result.scores.neutral * 100,
      confidence: result.confidence * 100,
      sentiment: result.sentiment
    }));
  };

  const getRadarData = () => {
    if (results.length === 0) return [];

    const metrics = ['Positive', 'Negative', 'Neutral', 'Confidence'];
    
    return metrics.map(metric => {
      const dataPoint: any = { metric };
      
      results.forEach((result, index) => {
        const label = (result as any).customLabel || `Text ${index + 1}`;
        switch (metric) {
          case 'Positive':
            dataPoint[label] = result.scores.positive * 100;
            break;
          case 'Negative':
            dataPoint[label] = result.scores.negative * 100;
            break;
          case 'Neutral':
            dataPoint[label] = result.scores.neutral * 100;
            break;
          case 'Confidence':
            dataPoint[label] = result.confidence * 100;
            break;
        }
      });
      
      return dataPoint;
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-100 text-emerald-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Comparative Analysis</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Compare sentiment across multiple texts to identify patterns, differences, and insights.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Texts to Compare</h3>
          <button
            onClick={addTextInput}
            disabled={texts.length >= 5}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Text</span>
          </button>
        </div>

        <div className="space-y-4">
          {texts.map((textItem, index) => (
            <div key={textItem.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={textItem.label}
                  onChange={(e) => updateText(textItem.id, 'label', e.target.value)}
                  className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  placeholder={`Text ${index + 1}`}
                />
                {texts.length > 2 && (
                  <button
                    onClick={() => removeTextInput(textItem.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={textItem.text}
                onChange={(e) => updateText(textItem.id, 'text', e.target.value)}
                placeholder="Enter text to analyze..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                disabled={isLoading}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleCompare}
          disabled={texts.filter(t => t.text.trim()).length < 2 || isLoading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5" />
              <span>Compare Sentiments</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {(result as any).customLabel || `Text ${index + 1}`}
                </h3>
                
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(result.sentiment)}`}>
                    {result.sentiment.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    {(result.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {Object.entries(result.scores).map(([sentiment, score]) => (
                    <div key={sentiment} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-gray-600">{sentiment}:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${score * 100}%`,
                              backgroundColor: getSentimentColor(sentiment)
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-10">
                          {(score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {result.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart Comparison */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sentiment Score Comparison</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Bar dataKey="positive" fill="#10B981" name="Positive" />
                    <Bar dataKey="negative" fill="#EF4444" name="Negative" />
                    <Bar dataKey="neutral" fill="#6B7280" name="Neutral" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Multi-dimensional Analysis</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={45} domain={[0, 100]} />
                    {results.map((result, index) => {
                      const label = (result as any).customLabel || `Text ${index + 1}`;
                      const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
                      return (
                        <Radar
                          key={index}
                          name={label}
                          dataKey={label}
                          stroke={colors[index % colors.length]}
                          fill={colors[index % colors.length]}
                          fillOpacity={0.1}
                        />
                      );
                    })}
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Insights</h3>
            <div className="space-y-3">
              {(() => {
                const mostPositive = results.reduce((max, r) => r.scores.positive > max.scores.positive ? r : max);
                const mostNegative = results.reduce((max, r) => r.scores.negative > max.scores.negative ? r : max);
                const highestConfidence = results.reduce((max, r) => r.confidence > max.confidence ? r : max);
                
                return (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                      
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-emerald-800">
                        <strong>{(mostPositive as any).customLabel}</strong> has the most positive sentiment 
                        ({(mostPositive.scores.positive * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-800">
                        <strong>{(mostNegative as any).customLabel}</strong> has the most negative sentiment 
                        ({(mostNegative.scores.negative * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-800">
                        <strong>{(highestConfidence as any).customLabel}</strong> has the highest confidence score 
                        ({(highestConfidence.confidence * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};