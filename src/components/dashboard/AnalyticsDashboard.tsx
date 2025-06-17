import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { SentimentResult } from '../../types/sentiment';
import { format, startOfDay, subDays, eachDayOfInterval } from 'date-fns';

interface AnalyticsDashboardProps {
  results: SentimentResult[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ results }) => {
  const analytics = useMemo(() => {
    if (!results.length) return null;

    // Overall sentiment distribution
    const sentimentCounts = results.reduce(
      (acc, result) => {
        acc[result.sentiment]++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    const totalResults = results.length;
    const sentimentPercentages = {
      positive: (sentimentCounts.positive / totalResults) * 100,
      negative: (sentimentCounts.negative / totalResults) * 100,
      neutral: (sentimentCounts.neutral / totalResults) * 100
    };

    // Average confidence by sentiment
    const confidenceBySentiment = Object.entries(sentimentCounts).map(([sentiment, count]) => {
      const sentimentResults = results.filter(r => r.sentiment === sentiment);
      const avgConfidence = count > 0 
        ? sentimentResults.reduce((sum, r) => sum + r.confidence, 0) / count 
        : 0;
      
      return {
        sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
        count,
        confidence: avgConfidence * 100
      };
    });

    // Trend analysis (last 7 days)
    const endDate = new Date();
    const startDate = subDays(endDate, 6);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const trendData = dateRange.map(date => {
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayResults = results.filter(r => 
        r.timestamp >= dayStart && r.timestamp < dayEnd
      );

      const daySentiments = dayResults.reduce(
        (acc, result) => {
          acc[result.sentiment]++;
          return acc;
        },
        { positive: 0, negative: 0, neutral: 0 }
      );

      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        positive: daySentiments.positive,
        negative: daySentiments.negative,
        neutral: daySentiments.neutral,
        total: dayResults.length
      };
    });

    // Top keywords
    const keywordFrequency = new Map<string, { count: number; sentiment: string }>();
    results.forEach(result => {
      result.keywords.forEach(keyword => {
        const existing = keywordFrequency.get(keyword.word) || { count: 0, sentiment: keyword.sentiment };
        existing.count++;
        keywordFrequency.set(keyword.word, existing);
      });
    });

    const topKeywords = Array.from(keywordFrequency.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([word, data]) => ({
        word,
        count: data.count,
        sentiment: data.sentiment
      }));

    return {
      sentimentCounts,
      sentimentPercentages,
      confidenceBySentiment,
      trendData,
      topKeywords,
      totalResults,
      averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    };
  }, [results]);

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">
          Start analyzing texts to see insights and trends in your dashboard.
        </p>
      </div>
    );
  }

  const COLORS = {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280'
  };

  const pieData = [
    { name: 'Positive', value: analytics.sentimentCounts.positive, color: COLORS.positive },
    { name: 'Negative', value: analytics.sentimentCounts.negative, color: COLORS.negative },
    { name: 'Neutral', value: analytics.sentimentCounts.neutral, color: COLORS.neutral }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
        </div>
        <p className="text-gray-600">
          Comprehensive insights and trends from your sentiment analysis data.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalResults}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics.averageConfidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 font-bold">+</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Positive</p>
              <p className="text-2xl font-bold text-emerald-600">
                {analytics.sentimentPercentages.positive.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 font-bold">-</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Negative</p>
              <p className="text-2xl font-bold text-red-600">
                {analytics.sentimentPercentages.negative.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sentiment Distribution Pie Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sentiment Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence by Sentiment */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Confidence by Sentiment</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.confidenceBySentiment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sentiment" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Confidence']} />
                <Bar 
                  dataKey="confidence" 
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">7-Day Sentiment Trend</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="positive"
                stackId="1"
                stroke={COLORS.positive}
                fill={COLORS.positive}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stackId="1"
                stroke={COLORS.neutral}
                fill={COLORS.neutral}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="negative"
                stackId="1"
                stroke={COLORS.negative}
                fill={COLORS.negative}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Keywords */}
      {analytics.topKeywords.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Most Frequent Keywords</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analytics.topKeywords.map((keyword, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-center ${
                  keyword.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-800' :
                  keyword.sentiment === 'negative' ? 'bg-red-50 text-red-800' :
                  'bg-gray-50 text-gray-800'
                }`}
              >
                <div className="font-medium">{keyword.word}</div>
                <div className="text-sm opacity-75">{keyword.count} times</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};