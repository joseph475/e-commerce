import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import apiService from '../services/api';

const TestPage = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [wsStatus, setWsStatus] = useState(null);
  const [wsConnection, setWsConnection] = useState(null);
  const [wsMessages, setWsMessages] = useState([]);
  const [testMessage, setTestMessage] = useState('Hello WebSocket!');

  useEffect(() => {
    testHealthEndpoint();
    testSupabaseEndpoint();
    initWebSocket();

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  const testHealthEndpoint = async () => {
    try {
      const response = await apiService.testHealth();
      setHealthStatus({
        success: true,
        data: response
      });
    } catch (error) {
      setHealthStatus({
        success: false,
        error: error.message
      });
    }
  };

  const testSupabaseEndpoint = async () => {
    try {
      const response = await apiService.testSupabase();
      setSupabaseStatus({
        success: true,
        data: response
      });
    } catch (error) {
      setSupabaseStatus({
        success: false,
        error: error.message
      });
    }
  };

  const initWebSocket = () => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setWsStatus({ connected: true, error: null });
        setWsConnection(ws);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setWsMessages(prev => [...prev, {
          ...message,
          id: Date.now()
        }]);
      };

      ws.onclose = () => {
        setWsStatus({ connected: false, error: 'Connection closed' });
        setWsConnection(null);
      };

      ws.onerror = (error) => {
        setWsStatus({ connected: false, error: 'Connection failed' });
      };
    } catch (error) {
      setWsStatus({ connected: false, error: error.message });
    }
  };

  const sendWebSocketMessage = () => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      wsConnection.send(testMessage);
      setTestMessage('');
    }
  };

  const StatusCard = ({ title, status, children }) => (
    <div class="card">
      <div class="flex items-center mb-4">
        <div class={`w-3 h-3 rounded-full mr-3 ${
          status?.success || status?.connected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <h3 class="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          API & WebSocket Tests
        </h1>
        <p class="text-lg text-gray-600">
          Test the backend API endpoints and WebSocket connection.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Health Check */}
        <StatusCard title="Health Check" status={healthStatus}>
          {healthStatus ? (
            <div class="space-y-3">
              <div class="text-sm">
                <span class="font-medium">Status:</span>
                <span class={`ml-2 ${healthStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {healthStatus.success ? 'Success' : 'Failed'}
                </span>
              </div>
              {healthStatus.success && (
                <>
                  <div class="text-sm">
                    <span class="font-medium">Message:</span>
                    <span class="ml-2">{healthStatus.data.message}</span>
                  </div>
                  <div class="text-sm">
                    <span class="font-medium">Environment:</span>
                    <span class="ml-2">{healthStatus.data.environment}</span>
                  </div>
                </>
              )}
              {!healthStatus.success && (
                <div class="text-sm text-red-600">
                  Error: {healthStatus.error}
                </div>
              )}
            </div>
          ) : (
            <div class="text-sm text-gray-500">Testing...</div>
          )}
        </StatusCard>

        {/* Supabase Test */}
        <StatusCard title="Supabase Connection" status={supabaseStatus}>
          {supabaseStatus ? (
            <div class="space-y-3">
              <div class="text-sm">
                <span class="font-medium">Status:</span>
                <span class={`ml-2 ${supabaseStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                  {supabaseStatus.success ? 'Connected' : 'Failed'}
                </span>
              </div>
              {supabaseStatus.success && (
                <div class="text-sm">
                  <span class="font-medium">Message:</span>
                  <span class="ml-2">{supabaseStatus.data.message}</span>
                </div>
              )}
              {!supabaseStatus.success && (
                <div class="text-sm text-red-600">
                  Error: {supabaseStatus.error}
                </div>
              )}
            </div>
          ) : (
            <div class="text-sm text-gray-500">Testing...</div>
          )}
        </StatusCard>
      </div>

      {/* WebSocket Test */}
      <div class="card">
        <div class="flex items-center mb-6">
          <div class={`w-3 h-3 rounded-full mr-3 ${
            wsStatus?.connected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <h3 class="text-lg font-semibold text-gray-900">WebSocket Connection</h3>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Connection Status</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Status:</span>
                <span class={`font-medium ${
                  wsStatus?.connected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {wsStatus?.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {wsStatus?.error && (
                <div class="text-red-600">
                  Error: {wsStatus.error}
                </div>
              )}
            </div>

            {/* Send Message */}
            <div class="mt-6">
              <h4 class="font-medium text-gray-900 mb-3">Send Test Message</h4>
              <div class="flex space-x-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter message..."
                  class="input flex-1"
                  disabled={!wsStatus?.connected}
                />
                <button
                  onClick={sendWebSocketMessage}
                  disabled={!wsStatus?.connected || !testMessage.trim()}
                  class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Messages</h4>
            <div class="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
              {wsMessages.length === 0 ? (
                <div class="text-gray-500 text-sm">No messages yet...</div>
              ) : (
                <div class="space-y-2">
                  {wsMessages.map((msg) => (
                    <div key={msg.id} class="bg-white rounded p-2 text-sm">
                      <div class="font-medium text-gray-900">{msg.type}</div>
                      <div class="text-gray-600">{msg.message}</div>
                      <div class="text-xs text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
