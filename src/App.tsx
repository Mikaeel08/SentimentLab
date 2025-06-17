import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './components/home/HomePage';
import { TextAnalyzer } from './components/analysis/TextAnalyzer';
import { BatchProcessor } from './components/analysis/BatchProcessor';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { AnalysisHistory } from './components/history/AnalysisHistory';
import { ComparativeAnalysis } from './components/comparison/ComparativeAnalysis';
import { ExportManager } from './components/export/ExportManager';
import { Settings } from './components/settings/Settings';
import { useSentimentAnalysis } from './hooks/useSentimentAnalysis';
import { huggingFaceService } from './services/huggingfaceApi';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [hasApiKey, setHasApiKey] = useState(false);

  const {
    results,
    batches,
    isLoading,
    progress,
    error,
    analyzeSingleText,
    analyzeBatch,
    clearResults,
    deleteResult,
    deleteBatch
  } = useSentimentAnalysis();

  useEffect(() => {
    // Set the API key automatically
    const apiKey = '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';
    localStorage.setItem('huggingface_api_key', apiKey);
    huggingFaceService.setApiKey(apiKey);
    setHasApiKey(true);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} />;
      case 'analyze':
        return (
          <TextAnalyzer
            onAnalyze={analyzeSingleText}
            isLoading={isLoading}
            error={error}
            hasApiKey={hasApiKey}
          />
        );
      case 'batch':
        return (
          <BatchProcessor
            onBatchAnalyze={analyzeBatch}
            isLoading={isLoading}
            progress={progress}
            error={error}
            hasApiKey={hasApiKey}
          />
        );
      case 'dashboard':
        return <AnalyticsDashboard results={results} />;
      case 'history':
        return (
          <AnalysisHistory
            results={results}
            batches={batches}
            onDeleteResult={deleteResult}
            onDeleteBatch={deleteBatch}
          />
        );
      case 'compare':
        return (
          <ComparativeAnalysis
            onAnalyze={analyzeSingleText}
            hasApiKey={hasApiKey}
          />
        );
      case 'export':
        return <ExportManager results={results} batches={batches} />;
      case 'settings':
        return <Settings />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        resultCount={results.length}
        batchCount={batches.length}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;