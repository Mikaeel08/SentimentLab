import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, AlertCircle, CheckCircle2, Eye, EyeOff, RefreshCw, Info } from 'lucide-react';
import { huggingFaceService } from '../../services/huggingfaceApi';

export const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedApiKey = localStorage.getItem('huggingface_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      huggingFaceService.setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim() && validateApiKey(apiKey)) {
      localStorage.setItem('huggingface_api_key', apiKey.trim());
      huggingFaceService.setApiKey(apiKey.trim());
      setConnectionStatus('success');
      setErrorMessage('');
      setTimeout(() => setConnectionStatus('idle'), 3000);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Please enter an API key first.');
      setConnectionStatus('error');
      return;
    }

    if (!validateApiKey(apiKey)) {
      setErrorMessage('Please enter a valid API key format.');
      setConnectionStatus('error');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      huggingFaceService.setApiKey(apiKey.trim());
      await huggingFaceService.testConnection();
      setConnectionStatus('success');
      setErrorMessage('');
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('huggingface_api_key');
    setConnectionStatus('idle');
    setErrorMessage('');
  };

  const validateApiKey = (key: string): boolean => {
    return key.trim().startsWith('hf_') && key.trim().length > 10;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        </div>
        <p className="text-gray-600">
          Configure your API settings and preferences for sentiment analysis.
        </p>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl font-semibold text-gray-900">Hugging Face API Configuration</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setConnectionStatus('idle');
                  setErrorMessage('');
                }}
                placeholder="Enter your Hugging Face API key (starts with hf_)"
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  apiKey && !validateApiKey(apiKey) ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showApiKey ? (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {apiKey && !validateApiKey(apiKey) && (
              <p className="text-sm text-red-600 mt-1">
                API key should start with "hf_" and be at least 10 characters long.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim() || !validateApiKey(apiKey)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save API Key
            </button>
            <button
              onClick={handleTestConnection}
              disabled={!apiKey.trim() || !validateApiKey(apiKey) || isTestingConnection}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isTestingConnection ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Test Connection</span>
            </button>
            <button
              onClick={handleClearApiKey}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Connection Status */}
          {connectionStatus === 'success' && (
            <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              <span>API key saved and connection successful!</span>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Connection failed</div>
                <div className="text-sm mt-1">{errorMessage}</div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
          <h4 className="font-medium text-emerald-900 mb-2">How to get your Hugging Face API Key:</h4>
          <ol className="text-sm text-emerald-800 space-y-1">
            <li>1. Visit <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-900">huggingface.co/settings/tokens</a></li>
            <li>2. Sign in to your Hugging Face account (create one if needed)</li>
            <li>3. Click "New token" and give it a name</li>
            <li>4. Select "Read" permission (sufficient for inference)</li>
            <li>5. Copy the generated token and paste it above</li>
          </ol>
          <p className="text-sm text-emerald-700 mt-3">
            <strong>Note:</strong> Without an API key, the application will run in demo mode with simulated results.
          </p>
        </div>

        {/* Troubleshooting */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Troubleshooting Connection Issues:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Ensure your API key starts with "hf_" and is correctly copied</li>
            <li>• Check that your Hugging Face account has API access enabled</li>
            <li>• Verify your internet connection is stable</li>
            <li>• The model may be loading - wait a few moments and try again</li>
            <li>• Free tier accounts have rate limits - wait between requests</li>
            <li>• If you get a 404 error, the system will automatically try a backup model</li>
          </ul>
        </div>

        {/* Model Information */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">Model Information:</h4>
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Primary: cardiffnlp/twitter-roberta-base-sentiment-latest</li>
            <li>• Fallback: nlptown/bert-base-multilingual-uncased-sentiment</li>
            <li>• Automatic failover if primary model is unavailable</li>
          </ul>
        </div>
      </div>

      {/* Usage Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Information</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Current Mode:</span>
            <span className={`font-medium ${apiKey && validateApiKey(apiKey) ? 'text-emerald-600' : 'text-yellow-600'}`}>
              {apiKey && validateApiKey(apiKey) ? 'Live API' : 'Demo Mode'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Model Used:</span>
            <span className="font-medium">cardiffnlp/twitter-roberta-base-sentiment-latest</span>
          </div>
          <div className="flex justify-between">
            <span>Rate Limiting:</span>
            <span className="font-medium">2 seconds between requests</span>
          </div>
          <div className="flex justify-between">
            <span>Text Limit:</span>
            <span className="font-medium">500 characters per request</span>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Security</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Your API key is stored locally in your browser only</li>
          <li>• Text data is sent to Hugging Face API for analysis</li>
          <li>• Analysis results are stored locally for your reference</li>
          <li>• No data is stored on our servers</li>
          <li>• You can clear all local data at any time</li>
          <li>• API requests are made over secure HTTPS connections</li>
        </ul>
      </div>
    </div>
  );
};