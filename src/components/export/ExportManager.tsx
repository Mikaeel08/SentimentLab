import React, { useState } from 'react';
import { Download, FileText, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { SentimentResult, BatchResult, ExportOptions } from '../../types/sentiment';
import { exportService } from '../../services/exportService';
import { format, subDays } from 'date-fns';

interface ExportManagerProps {
  results: SentimentResult[];
  batches: BatchResult[];
}

export const ExportManager: React.FC<ExportManagerProps> = ({ results, batches }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeKeywords: true,
    includeConfidence: true,
    includeTimestamp: true
  });
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [useDateFilter, setUseDateFilter] = useState(false);

  const handleExport = () => {
    let dataToExport = results;

    // Filter by batch if selected
    if (selectedBatch !== 'all') {
      const batch = batches.find(b => b.id === selectedBatch);
      if (batch) {
        dataToExport = batch.results;
      }
    }

    // Apply date filter if enabled
    const options: ExportOptions = {
      ...exportOptions,
      dateRange: useDateFilter ? {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end + 'T23:59:59')
      } : undefined
    };

    switch (exportOptions.format) {
      case 'csv':
        exportService.exportToCSV(dataToExport, options);
        break;
      case 'json':
        exportService.exportToJSON(dataToExport, options);
        break;
      case 'pdf':
        exportService.exportToPDF(dataToExport, options);
        break;
    }
  };

  const handleBatchExport = (batch: BatchResult) => {
    exportService.exportBatchToPDF(batch);
  };

  const getFilteredCount = () => {
    let count = results.length;
    
    if (selectedBatch !== 'all') {
      const batch = batches.find(b => b.id === selectedBatch);
      count = batch ? batch.results.length : 0;
    }
    
    if (useDateFilter) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end + 'T23:59:59');
      
      let dataToCheck = results;
      if (selectedBatch !== 'all') {
        const batch = batches.find(b => b.id === selectedBatch);
        dataToCheck = batch ? batch.results : [];
      }
      
      count = dataToCheck.filter(r => r.timestamp >= startDate && r.timestamp <= endDate).length;
    }
    
    return count;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Export & Reports</h2>
        </div>
        <p className="text-gray-600">
          Generate comprehensive reports and export your sentiment analysis data in various formats.
        </p>
      </div>

      {/* Export Configuration */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-semibold text-gray-900">Export Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
            <div className="space-y-2">
              {[
                { value: 'csv', label: 'CSV', description: 'Spreadsheet compatible format' },
                { value: 'json', label: 'JSON', description: 'Structured data format' },
                { value: 'pdf', label: 'PDF', description: 'Formatted report document' }
              ].map((format) => (
                <label key={format.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportOptions.format === format.value}
                    onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as any })}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{format.label}</div>
                    <div className="text-sm text-gray-600">{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Data Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Data Source</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-4"
            >
              <option value="all">All Results ({results.length} items)</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.results.length} items)
                </option>
              ))}
            </select>

            {/* Include Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeConfidence}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeConfidence: e.target.checked })}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Include confidence scores</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeKeywords}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeKeywords: e.target.checked })}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Include keywords</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTimestamp}
                  onChange={(e) => setExportOptions({ ...exportOptions, includeTimestamp: e.target.checked })}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Include timestamps</span>
              </label>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              id="date-filter"
              checked={useDateFilter}
              onChange={(e) => setUseDateFilter(e.target.checked)}
              className="text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="date-filter" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>Filter by date range</span>
            </label>
          </div>

          {useDateFilter && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="mt-6 p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-orange-900">Ready to export</p>
              <p className="text-sm text-orange-700">
                {getFilteredCount()} results will be exported as {exportOptions.format.toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={getFilteredCount() === 0}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Batch Reports */}
      {batches.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Batch Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.slice(0, 6).map((batch) => (
              <div key={batch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 truncate">{batch.name}</h4>
                  <button
                    onClick={() => handleBatchExport(batch)}
                    className="text-orange-600 hover:text-orange-700 flex items-center space-x-1 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Results:</span>
                    <span>{batch.summary.totalTexts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{format(batch.createdAt, 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-orange-600">{results.length}</div>
          <div className="text-sm text-gray-600">Total Analyses</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-600">{batches.length}</div>
          <div className="text-sm text-gray-600">Batch Reports</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
          <div className="text-3xl font-bold text-purple-600">
            {results.length > 0 ? (results.reduce((sum, r) => sum + r.confidence, 0) / results.length * 100).toFixed(0) : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Confidence</div>
        </div>
      </div>
    </div>
  );
};