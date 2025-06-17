const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest';
const FALLBACK_API_URL = 'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment';

interface HuggingFaceResponse {
  label: string;
  score: number;
}

interface HuggingFaceError {
  error: string;
  estimated_time?: number;
}

class HuggingFaceService {
  private apiKey: string | null = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private rateLimitDelay = 2000; // 2 seconds between requests for better reliability
  private currentApiUrl = HUGGINGFACE_API_URL;

  setApiKey(apiKey: string) {
    this.apiKey = apiKey?.trim();
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
        // Rate limiting - increased delay for better reliability
        await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
      }
    }
    
    this.isProcessing = false;
  }

  private async makeApiCall(text: string, useFailover: boolean = false): Promise<HuggingFaceResponse[]> {
    if (!this.apiKey || this.apiKey.length === 0) {
      throw new Error('Hugging Face API key not set. Please add your API key in the settings.');
    }

    // Validate API key format
    if (!this.apiKey.startsWith('hf_')) {
      throw new Error('Invalid API key format. Hugging Face API keys should start with "hf_".');
    }

    const apiUrl = useFailover ? FALLBACK_API_URL : this.currentApiUrl;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SentimentAnalysisDashboard/1.0'
        },
        body: JSON.stringify({
          inputs: text.substring(0, 500), // Limit text length to avoid issues
          options: {
            wait_for_model: true,
            use_cache: false
          }
        }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `API request failed (${response.status}): ${response.statusText}`;
        
        // Handle 404 specifically
        if (response.status === 404) {
          if (!useFailover) {
            console.log('Primary model not found, trying fallback model...');
            return this.makeApiCall(text, true);
          } else {
            throw new Error('Model not found. The sentiment analysis model may be temporarily unavailable. Please try again later.');
          }
        }
        
        try {
          const errorData: HuggingFaceError = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
            
            if (errorData.estimated_time) {
              errorMessage += ` Model is loading, estimated time: ${errorData.estimated_time}s. Please try again in a moment.`;
            }
          }
        } catch (parseError) {
          // Use the default error message if JSON parsing fails
        }

        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Hugging Face API key in Settings.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. Please check your API key permissions or try a different model.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before making more requests.');
        } else if (response.status === 503) {
          throw new Error('Model is currently loading. Please try again in a few moments.');
        } else {
          throw new Error(errorMessage);
        }
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response format from API. Please try again.');
      }
      
      // Handle different response formats
      if (Array.isArray(data) && data.length > 0) {
        if (Array.isArray(data[0])) {
          return data[0]; // Standard format
        } else if (data[0].label && data[0].score !== undefined) {
          return data; // Alternative format
        }
      }
      
      throw new Error('Unexpected API response format. Please try again.');
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  private mapSentimentLabel(label: string): 'positive' | 'negative' | 'neutral' {
    const normalizedLabel = label.toLowerCase();
    
    // Handle different label formats from various models
    if (normalizedLabel.includes('positive') || normalizedLabel === 'label_2' || normalizedLabel === 'pos' || normalizedLabel.includes('5 stars') || normalizedLabel.includes('4 stars')) {
      return 'positive';
    } else if (normalizedLabel.includes('negative') || normalizedLabel === 'label_0' || normalizedLabel === 'neg' || normalizedLabel.includes('1 star') || normalizedLabel.includes('2 stars')) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  private extractKeywords(text: string, sentiment: 'positive' | 'negative' | 'neutral'): Array<{
    word: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    weight: number;
  }> {
    // Enhanced keyword extraction
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'perfect', 'awesome',
      'outstanding', 'brilliant', 'superb', 'magnificent', 'incredible', 'marvelous', 'exceptional', 'delightful',
      'impressive', 'remarkable', 'beautiful', 'lovely', 'nice', 'pleasant', 'enjoyable', 'satisfying'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointing', 'poor', 'useless', 'disgusting',
      'dreadful', 'appalling', 'atrocious', 'abysmal', 'pathetic', 'miserable', 'unpleasant', 'annoying',
      'frustrating', 'irritating', 'boring', 'stupid', 'ridiculous', 'waste', 'failure', 'broken'
    ];
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const keywords: Array<{ word: string; sentiment: 'positive' | 'negative' | 'neutral'; weight: number; }> = [];
    
    words.forEach(word => {
      if (positiveWords.includes(word)) {
        keywords.push({ word, sentiment: 'positive', weight: 0.8 });
      } else if (negativeWords.includes(word)) {
        keywords.push({ word, sentiment: 'negative', weight: 0.8 });
      }
    });
    
    // Remove duplicates and return top 5
    const uniqueKeywords = keywords.filter((keyword, index, self) => 
      index === self.findIndex(k => k.word === keyword.word)
    );
    
    return uniqueKeywords.slice(0, 5);
  }

  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    scores: { positive: number; negative: number; neutral: number };
    keywords: Array<{ word: string; sentiment: 'positive' | 'negative' | 'neutral'; weight: number; }>;
    explanation: string;
  }> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const results = await this.makeApiCall(text);
          
          // Initialize scores
          const scores = { positive: 0, negative: 0, neutral: 0 };
          
          // Process results and normalize scores
          let totalScore = 0;
          results.forEach((result: HuggingFaceResponse) => {
            const mappedSentiment = this.mapSentimentLabel(result.label);
            scores[mappedSentiment] = Math.max(0, Math.min(1, result.score)); // Ensure score is between 0 and 1
            totalScore += scores[mappedSentiment];
          });
          
          // Normalize scores to sum to 1 if needed
          if (totalScore > 0 && Math.abs(totalScore - 1) > 0.01) {
            Object.keys(scores).forEach(key => {
              scores[key as keyof typeof scores] = scores[key as keyof typeof scores] / totalScore;
            });
          }
          
          // Find the highest scoring sentiment
          const sentiment = Object.entries(scores).reduce((a, b) => 
            scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
          )[0] as 'positive' | 'negative' | 'neutral';
          
          const confidence = scores[sentiment];
          const keywords = this.extractKeywords(text, sentiment);
          const explanation = this.generateExplanation(sentiment, confidence, keywords);
          
          resolve({
            sentiment,
            confidence,
            scores,
            keywords,
            explanation
          });
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private generateExplanation(
    sentiment: 'positive' | 'negative' | 'neutral',
    confidence: number,
    keywords: Array<{ word: string; sentiment: string; weight: number; }>
  ): string {
    const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'moderate' : 'low';
    const keywordText = keywords.length > 0 
      ? ` Key indicators include words like: ${keywords.map(k => k.word).join(', ')}.`
      : '';
    
    return `This text shows ${sentiment} sentiment with ${confidenceLevel} confidence (${(confidence * 100).toFixed(1)}%).${keywordText}`;
  }

  // Enhanced demo mode
  async analyzeSentimentDemo(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    scores: { positive: number; negative: number; neutral: number };
    keywords: Array<{ word: string; sentiment: 'positive' | 'negative' | 'neutral'; weight: number; }>;
    explanation: string;
  }> {
    // Simulate realistic API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Enhanced rule-based sentiment analysis for demo
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'perfect', 'awesome',
      'outstanding', 'brilliant', 'superb', 'magnificent', 'incredible', 'marvelous', 'exceptional', 'delightful'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointing', 'poor', 'useless', 'disgusting',
      'dreadful', 'appalling', 'atrocious', 'abysmal', 'pathetic', 'miserable', 'unpleasant', 'annoying'
    ];
    
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    let confidence: number;
    
    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      confidence = Math.min(0.65 + (positiveScore * 0.08), 0.92);
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = Math.min(0.65 + (negativeScore * 0.08), 0.92);
    } else {
      sentiment = 'neutral';
      confidence = 0.55 + Math.random() * 0.25;
    }
    
    // Create realistic score distribution
    const remaining = 1 - confidence;
    const scores = {
      positive: sentiment === 'positive' ? confidence : Math.random() * remaining * 0.6,
      negative: sentiment === 'negative' ? confidence : Math.random() * remaining * 0.6,
      neutral: sentiment === 'neutral' ? confidence : Math.random() * remaining * 0.6
    };
    
    // Normalize scores to sum to 1
    const total = scores.positive + scores.negative + scores.neutral;
    scores.positive /= total;
    scores.negative /= total;
    scores.neutral /= total;
    
    const keywords = this.extractKeywords(text, sentiment);
    const explanation = this.generateExplanation(sentiment, confidence, keywords);
    
    return { sentiment, confidence, scores, keywords, explanation };
  }

  // Test connection method with fallback
  async testConnection(): Promise<boolean> {
    try {
      await this.analyzeSentiment('This is a test message.');
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export const huggingFaceService = new HuggingFaceService();