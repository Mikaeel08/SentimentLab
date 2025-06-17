import React, { useState } from 'react';
import { History, Trash2, Download, Search, Filter, Calendar } from 'lucide-react';
import { SentimentResult, BatchResult } from '../../types/sentiment';
import { format } from 'date-fns';

interface AnalysisHistoryProps {
  results: SentimentResult[];
  batches: BatchResult[];
  onDeleteResult: (id: string) => void;
  onDeleteBatch: (id: string) => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  results,
  batches,
  onDeleteResult,
  onDeleteBatch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'individual' | 'batches'>('individual');

  const filteredResults = results.filter(result => {
    const matchesSearch = result.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || result.sentiment === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  const filteredBatches = batches.filter(batch => 
    batch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentBadgeColor = (sentiment: string) => {
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
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Analysis History</h2>
        </div>
        <p className="text-gray-600">
          Review and manage your past sentiment analyses and batch processing results.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('individual')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'individual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Individual Analyses ({results.length})
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'batches'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Batch Analyses ({batches.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'individual' ? 'texts' : 'batch names'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {activeTab === 'individual' && (
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'individual' ? (
        <div className="space-y-4">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {results.length === 0 ? 'No Analyses Yet' : 'No Results Found'}
              </h3>
              <p className="text-gray-600">
                {results.length === 0 
                  ? 'Start analyzing texts to see your history here.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          ) : (
            filteredResults.map((result) => (
              <div key={result.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentBadgeColor(result.sentiment)}`}>
                      {result.sentiment.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {(result.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {format(result.timestamp, 'MMM dd, yyyy HH:mm')}
                    </span>
                    <button
                      onClick={() => onDeleteResult(result.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-800 mb-4 leading-relaxed">{result.text}</p>

                {result.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded text-xs ${getSentimentBadgeColor(keyword.sentiment)}`}
                      >
                        {keyword.word}
                      </span>
                    ))}
                  </div>
                )}

                {result.explanation && (
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-emerald-800 text-sm">{result.explanation}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {batches.length === 0 ? 'No Batch Analyses Yet' : 'No Batches Found'}
              </h3>
              <p className="text-gray-600">
                {batches.length === 0 
                  ? 'Process batch analyses to see your history here.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <div key={batch.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{batch.name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(batch.createdAt, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteBatch(batch.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{batch.summary.totalTexts}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{batch.summary.positiveCount}</div>
                    <div className="text-sm text-gray-600">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{batch.summary.negativeCount}</div>
                    <div className="text-sm text-gray-600">Negative</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{batch.summary.neutralCount}</div>
                    <div className="text-sm text-gray-600">Neutral</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Average Confidence</span>
                    <span className="text-sm text-gray-600">
                      {(batch.summary.averageConfidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${batch.summary.averageConfidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};