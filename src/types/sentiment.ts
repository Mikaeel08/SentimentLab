export interface SentimentResult {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: Array<{
    word: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  timestamp: Date;
  explanation?: string;
}

export interface BatchResult {
  id: string;
  name: string;
  results: SentimentResult[];
  summary: {
    totalTexts: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    averageConfidence: number;
  };
  createdAt: Date;
}

export interface AnalysisState {
  isLoading: boolean;
  progress: number;
  error: string | null;
  results: SentimentResult[];
  batches: BatchResult[];
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeKeywords: boolean;
  includeConfidence: boolean;
  includeTimestamp: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}