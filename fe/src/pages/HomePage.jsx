import { h } from 'preact';

const HomePage = ({ apiStatus }) => {
  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Boilerplate App
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
          A modern full-stack boilerplate built with Node.js, Express, Supabase, Preact, Webpack, and Tailwind CSS.
          Ready to use for your next project.
        </p>
      </div>

      {/* Status Cards */}
      <div class="grid md:grid-cols-2 gap-8 mb-12">
        {/* Frontend Status */}
        <div class="card">
          <div class="flex items-center mb-4">
            <div class="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <h3 class="text-lg font-semibold text-gray-900">Frontend Status</h3>
          </div>
          <p class="text-gray-600 mb-4">
            Frontend application is running successfully with Preact and Tailwind CSS.
          </p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Framework:</span>
              <span class="font-medium">Preact</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Bundler:</span>
              <span class="font-medium">Webpack</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Styling:</span>
              <span class="font-medium">Tailwind CSS</span>
            </div>
          </div>
        </div>

        {/* Backend Status */}
        <div class="card">
          <div class="flex items-center mb-4">
            <div class={`w-3 h-3 rounded-full mr-3 ${
              apiStatus?.connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <h3 class="text-lg font-semibold text-gray-900">Backend Status</h3>
          </div>
          <p class="text-gray-600 mb-4">
            {apiStatus?.connected 
              ? 'Backend API is connected and responding.'
              : 'Backend API is not responding. Make sure the server is running.'
            }
          </p>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Status:</span>
              <span class={`font-medium ${
                apiStatus?.connected ? 'text-green-600' : 'text-red-600'
              }`}>
                {apiStatus?.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {apiStatus?.timestamp && (
              <div class="flex justify-between">
                <span class="text-gray-500">Last Check:</span>
                <span class="font-medium">
                  {new Date(apiStatus.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Technology Stack</h3>
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Backend</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li>• Node.js with Express framework</li>
              <li>• Supabase for database and authentication</li>
              <li>• JWT for token-based authentication</li>
              <li>• WebSocket support for real-time features</li>
              <li>• CORS enabled for cross-origin requests</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 mb-3">Frontend</h4>
            <ul class="space-y-2 text-sm text-gray-600">
              <li>• Preact for lightweight React-like experience</li>
              <li>• Webpack for module bundling and optimization</li>
              <li>• Tailwind CSS for utility-first styling</li>
              <li>• Babel for JavaScript transpilation</li>
              <li>• Hot reload for development</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div class="card mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
        <div class="prose prose-sm max-w-none">
          <ol class="list-decimal list-inside space-y-2 text-gray-600">
            <li>Copy <code class="bg-gray-100 px-1 rounded">.env.example</code> to <code class="bg-gray-100 px-1 rounded">.env</code> in both frontend and backend directories</li>
            <li>Configure your Supabase credentials in the environment files</li>
            <li>Install dependencies: <code class="bg-gray-100 px-1 rounded">npm install</code> in both directories</li>
            <li>Start the backend: <code class="bg-gray-100 px-1 rounded">npm run dev</code> in the <code class="bg-gray-100 px-1 rounded">be/</code> directory</li>
            <li>Start the frontend: <code class="bg-gray-100 px-1 rounded">npm run dev</code> in the <code class="bg-gray-100 px-1 rounded">fe/</code> directory</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
