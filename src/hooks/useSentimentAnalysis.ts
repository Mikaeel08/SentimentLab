import { useState, useCallback } from 'react';
import { SentimentResult, BatchResult, AnalysisState } from '../types/sentiment';
import { huggingFaceService } from '../services/huggingfaceApi';

export const useSentimentAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    progress: 0,
    error: null,
    results: JSON.parse(localStorage.getItem('sentimentResults') || '[]').map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp)
    })),
    batches: JSON.parse(localStorage.getItem('sentimentBatches') || '[]').map((b: any) => ({
      ...b,
      createdAt: new Date(b.createdAt),
      results: b.results.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      }))
    }))
  });

  const saveToLocalStorage = useCallback((results: SentimentResult[], batches: BatchResult[]) => {
    localStorage.setItem('sentimentResults', JSON.stringify(results));
    localStorage.setItem('sentimentBatches', JSON.stringify(batches));
  }, []);

  const analyzeSingleText = useCallback(async (text: string, useDemo: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, progress: 0 }));
    
    try {
      const analysis = useDemo 
        ? await huggingFaceService.analyzeSentimentDemo(text)
        : await huggingFaceService.analyzeSentiment(text);
      
      const result: SentimentResult = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        scores: analysis.scores,
        keywords: analysis.keywords,
        timestamp: new Date(),
        explanation: analysis.explanation
      };

      setState(prev => {
        const newResults = [result, ...prev.results];
        saveToLocalStorage(newResults, prev.batches);
        return {
          ...prev,
          results: newResults,
          isLoading: false,
          progress: 100
        };
      });

      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
      throw error;
    }
  }, [saveToLocalStorage]);

  const analyzeBatch = useCallback(async (texts: string[], batchName: string, useDemo: boolean = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, progress: 0 }));
    
    try {
      const results: SentimentResult[] = [];
      const total = texts.length;

      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (text.trim()) {
          const analysis = useDemo 
            ? await huggingFaceService.analyzeSentimentDemo(text)
            : await huggingFaceService.analyzeSentiment(text);
          
          const result: SentimentResult = {
            id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text,
            sentiment: analysis.sentiment,
            confidence: analysis.confidence,
            scores: analysis.scores,
            keywords: analysis.keywords,
            timestamp: new Date(),
            explanation: analysis.explanation
          };

          results.push(result);
        }

        setState(prev => ({
          ...prev,
          progress: ((i + 1) / total) * 100
        }));
      }

      const batch: BatchResult = {
        id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: batchName,
        results,
        summary: {
          totalTexts: results.length,
          positiveCount: results.filter(r => r.sentiment === 'positive').length,
          negativeCount: results.filter(r => r.sentiment === 'negative').length,
          neutralCount: results.filter(r => r.sentiment === 'neutral').length,
          averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length
        },
        createdAt: new Date()
      };

      setState(prev => {
        const newResults = [...results, ...prev.results];
        const newBatches = [batch, ...prev.batches];
        saveToLocalStorage(newResults, newBatches);
        return {
          ...prev,
          results: newResults,
          batches: newBatches,
          isLoading: false
        };
      });

      return batch;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Batch analysis failed'
      }));
      throw error;
    }
  }, [saveToLocalStorage]);

  const clearResults = useCallback(() => {
    setState(prev => ({ ...prev, results: [], batches: [] }));
    localStorage.removeItem('sentimentResults');
    localStorage.removeItem('sentimentBatches');
  }, []);

  const deleteResult = useCallback((id: string) => {
    setState(prev => {
      const newResults = prev.results.filter(r => r.id !== id);
      saveToLocalStorage(newResults, prev.batches);
      return { ...prev, results: newResults };
    });
  }, [saveToLocalStorage]);

  const deleteBatch = useCallback((id: string) => {
    setState(prev => {
      const batch = prev.batches.find(b => b.id === id);
      const newBatches = prev.batches.filter(b => b.id !== id);
      const newResults = batch 
        ? prev.results.filter(r => !batch.results.some(br => br.id === r.id))
        : prev.results;
      
      saveToLocalStorage(newResults, newBatches);
      return { ...prev, results: newResults, batches: newBatches };
    });
  }, [saveToLocalStorage]);

  return {
    ...state,
    analyzeSingleText,
    analyzeBatch,
    clearResults,
    deleteResult,
    deleteBatch
  };
};