import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, AlertCircle, Plus, X, Play } from 'lucide-react';
import Papa from 'papaparse';
import { BatchResult } from '../../types/sentiment';

interface BatchProcessorProps {
  onBatchAnalyze: (texts: string[], batchName: string, useDemo?: boolean) => Promise<BatchResult>;
  isLoading: boolean;
  progress: number;
  error: string | null;
  hasApiKey: boolean;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
  onBatchAnalyze,
  isLoading,
  progress,
  error,
  hasApiKey
}) => {
  const [batchName, setBatchName] = useState('');
  const [texts, setTexts] = useState<string[]>(['']);
  const [result, setResult] = useState<BatchResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.name.endsWith('.csv')) {
        Papa.parse(content, {
          header: true,
          complete: (results) => {
            const textColumn = results.meta.fields?.find(field => 
              field.toLowerCase().includes('text') || 
              field.toLowerCase().includes('comment') ||
              field.toLowerCase().includes('review')
            );
            
            if (textColumn) {
              const extractedTexts = results.data
                .map((row: any) => row[textColumn])
                .filter(text => text && text.trim())
                .slice(0, 100); // Limit to 100 items
              
              setTexts(extractedTexts);
            } else {
              // Use first column if no text column found
              const firstColumn = results.meta.fields?.[0];
              if (firstColumn) {
                const extractedTexts = results.data
                  .map((row: any) => row[firstColumn])
                  .filter(text => text && text.trim())
                  .slice(0, 100);
                
                setTexts(extractedTexts);
              }
            }
          }
        });
      } else {
        // Plain text file - split by lines
        const lines = content.split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .slice(0, 100);
        
        setTexts(lines);
      }
    };
    
    reader.readAsText(file);
  };

  const addTextInput = () => {
    setTexts([...texts, '']);
  };

  const removeTextInput = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  const updateText = (index: number, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validTexts = texts.filter(t => t.trim());
    if (!validTexts.length || !batchName.trim() || isLoading) return;

    try {
      const batchResult = await onBatchAnalyze(validTexts, batchName.trim(), !hasApiKey);
      setResult(batchResult);
      setTexts(['']);
      setBatchName('');
    } catch (error) {
      // Error handled by parent component
    }
  };

  const getSentimentColor = (sentiment: string) => {
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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Batch Processing</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Process multiple texts simultaneously for comprehensive sentiment analysis. Upload files or enter texts manually.
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
                Batch processing in demo mode is limited to simulated results.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload File</h3>
        <p className="text-gray-600 mb-4">
          Upload a CSV or TXT file containing texts to analyze
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Choose File
        </button>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="batch-name" className="block text-sm font-medium text-gray-700 mb-2">
            Batch Name
          </label>
          <input
            id="batch-name"
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="Enter a name for this batch (e.g., Customer Reviews Q1 2024)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Texts to Analyze ({texts.filter(t => t.trim()).length} items)
            </label>
            <button
              type="button"
              onClick={addTextInput}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
              <span>Add Text</span>
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {texts.map((text, index) => (
              <div key={index} className="flex space-x-2">
                <textarea
                  value={text}
                  onChange={(e) => updateText(index, e.target.value)}
                  placeholder={`Text ${index + 1}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-20"
                  disabled={isLoading}
                />
                {texts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTextInput(index)}
                    className="p-2 text-gray-400 hover:text-red-600 flex-shrink-0"
                    disabled={isLoading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Processing batch...</span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!texts.filter(t => t.trim()).length || !batchName.trim() || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing {Math.round(progress)}%</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start Batch Analysis</span>
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
              <h3 className="font-medium text-red-800">Batch Processing Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Batch Analysis Complete: {result.name}
            </h3>
            <div className="text-sm text-gray-500">
              {result.createdAt.toLocaleString()}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{result.summary.totalTexts}</div>
              <div className="text-sm text-blue-600">Total Texts</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">{result.summary.positiveCount}</div>
              <div className="text-sm text-emerald-600">Positive</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{result.summary.negativeCount}</div>
              <div className="text-sm text-red-600">Negative</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600">{result.summary.neutralCount}</div>
              <div className="text-sm text-gray-600">Neutral</div>
            </div>
          </div>

          {/* Average Confidence */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Average Confidence</span>
              <span className="text-sm text-gray-600">
                {(result.summary.averageConfidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                style={{ width: `${result.summary.averageConfidence * 100}%` }}
              />
            </div>
          </div>

          {/* Sample Results */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Sample Results</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {result.results.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                    {item.sentiment.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600 flex-1 truncate">
                    {item.text}
                  </span>
                  <span className="text-sm text-gray-500">
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
            {result.results.length > 5 && (
              <p className="text-sm text-gray-500 mt-2">
                ... and {result.results.length - 5} more results
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};