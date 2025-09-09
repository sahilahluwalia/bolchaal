'use client';

import { useState, useEffect } from 'react';
import { TokenDebugService } from '../../utils/tokenRefresh';

export default function TokenDebugPage() {
  const [tokenStatus, setTokenStatus] = useState({
    hasAccessToken: false,
    isExpired: true,
    tokenLength: 0,
  });
  const [refreshResult, setRefreshResult] = useState<string>('');

  const checkTokens = () => {
    const status = TokenDebugService.getTokenStatus();
    setTokenStatus(status);
  };

  const handleRefresh = async () => {
    try {
      const result = await TokenDebugService.debugRefresh();
      setRefreshResult(result.success ? '✅ Token refreshed successfully!' : `❌ Refresh failed: ${result.error}`);
      checkTokens(); // Re-check status after refresh
    } catch (error) {
      setRefreshResult(`❌ Refresh error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    checkTokens();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Token Debug Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Token Status</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Access Token:</span>
              <span className={tokenStatus.hasAccessToken ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {tokenStatus.hasAccessToken ? "✅ Present" : "❌ Missing"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Token Status:</span>
              <span className={tokenStatus.isExpired ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                {tokenStatus.isExpired ? "⚠️ Expired" : "✅ Valid"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Token Length:</span>
              <span className="font-mono text-sm">{tokenStatus.tokenLength} characters</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Refresh Token:</span>
              <span className="text-gray-600 font-medium">
                🔒 HTTP-only (secure)
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={checkTokens}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              🔄 Refresh Status
            </button>

            <button
              onClick={handleRefresh}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              🔄 Force Token Refresh
            </button>
          </div>

          {refreshResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <strong>Last Refresh Result:</strong> {refreshResult}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How Token Refresh Works</h2>

          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <strong>1. Automatic Refresh:</strong> When your access token expires, the system automatically detects 401 errors and triggers a refresh.
            </div>

            <div>
              <strong>2. Refresh Process:</strong>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Frontend detects expired token</li>
                <li>Calls refreshToken mutation</li>
                <li>Backend validates refresh token from HTTP cookie</li>
                <li>Generates new access and refresh tokens</li>
                <li>Updates database and sets new cookie</li>
                <li>Frontend receives new access token</li>
              </ul>
            </div>

            <div>
              <strong>3. Troubleshooting:</strong>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>Check browser console for errors</li>
                <li>Verify refresh token cookie exists</li>
                <li>Ensure backend server is running</li>
                <li>Check network tab for failed requests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
