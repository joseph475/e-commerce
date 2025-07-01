const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const dotenv = require('dotenv');

// Load environment variables before webpack config
dotenv.config({ path: '../../.env' });
dotenv.config({ path: './.env' });

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      publicPath: '/'
    },
    resolve: {
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat'
      },
      extensions: ['.js', '.jsx', '.json']
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                ['@babel/plugin-transform-react-jsx', { pragma: 'h' }]
              ]
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer')
                  ]
                }
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html'
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/index.html']
            },
            noErrorOnMissing: true
          },
          {
            from: 'src/_redirects',
            to: '_redirects',
            noErrorOnMissing: true
          }
        ]
      }),
      // Manual PWA file creation plugin
      new (class {
        apply(compiler) {
          compiler.hooks.afterEmit.tap('CreatePWAFiles', () => {
            const fs = require('fs');
            const path = require('path');
            
            const distPath = path.resolve(__dirname, 'dist');
            
            // Create icons directory
            const iconsPath = path.join(distPath, 'icons');
            if (!fs.existsSync(iconsPath)) {
              fs.mkdirSync(iconsPath, { recursive: true });
            }
            
            // Create a simple SVG icon
            const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" fill="#3b82f6" rx="64"/>
              <g fill="white">
                <rect x="96" y="160" width="320" height="240" rx="16" fill="white"/>
                <rect x="112" y="176" width="288" height="80" rx="8" fill="#3b82f6"/>
                <rect x="128" y="192" width="256" height="48" rx="4" fill="white"/>
                <text x="256" y="224" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#3b82f6">POS</text>
                <circle cx="144" cy="296" r="16" fill="#e5e7eb"/>
                <circle cx="192" cy="296" r="16" fill="#e5e7eb"/>
                <circle cx="240" cy="296" r="16" fill="#e5e7eb"/>
                <circle cx="288" cy="296" r="16" fill="#e5e7eb"/>
                <circle cx="336" cy="296" r="16" fill="#e5e7eb"/>
                <circle cx="144" cy="336" r="16" fill="#e5e7eb"/>
                <circle cx="192" cy="336" r="16" fill="#e5e7eb"/>
                <circle cx="240" cy="336" r="16" fill="#e5e7eb"/>
                <circle cx="288" cy="336" r="16" fill="#e5e7eb"/>
                <circle cx="336" cy="336" r="16" fill="#e5e7eb"/>
                <rect x="112" y="360" width="288" height="24" rx="4" fill="#9ca3af"/>
                <rect x="120" y="364" width="16" height="16" rx="2" fill="#6b7280"/>
              </g>
            </svg>`;
            
            fs.writeFileSync(path.join(iconsPath, 'icon.svg'), svgIcon);
            console.log('✅ Created icon.svg');
            
            // Create manifest.json
            const manifest = {
              "name": "POS - Point of Sale System",
              "short_name": "POS",
              "description": "A modern point of sale system for retail businesses",
              "start_url": "/",
              "display": "standalone",
              "background_color": "#ffffff",
              "theme_color": "#3b82f6",
              "orientation": "portrait-primary",
              "scope": "/",
              "categories": ["business", "productivity"],
              "icons": [
                {
                  "src": "/icons/icon.svg",
                  "sizes": "any",
                  "type": "image/svg+xml",
                  "purpose": "maskable any"
                },
                {
                  "src": "/favicon.ico",
                  "sizes": "32x32",
                  "type": "image/x-icon",
                  "purpose": "any"
                }
              ]
            };
            
            fs.writeFileSync(path.join(distPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
            console.log('✅ Created manifest.json');
            
            // Create service worker
            const swContent = `
const CACHE_NAME = 'pos-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;
            
            fs.writeFileSync(path.join(distPath, 'sw.js'), swContent);
            console.log('✅ Created sw.js');
            
            // Create offline page
            const offlineContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POS - Offline</title>
    <meta name="theme-color" content="#3b82f6">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 400px;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        p {
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .retry-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>You're Offline</h1>
        <p>Your POS system is still available with limited functionality.</p>
        <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
    </div>
</body>
</html>
`;
            
            fs.writeFileSync(path.join(distPath, 'offline.html'), offlineContent);
            console.log('✅ Created offline.html');
          });
        }
      })(),
      // Load root .env first (shared variables)
      new Dotenv({
        path: '../../.env',
        safe: false,
        allowEmptyValues: true,
        systemvars: true
      }),
      // Load package-specific .env (overrides root .env)
      new Dotenv({
        path: './.env',
        safe: false,
        allowEmptyValues: true,
        systemvars: true
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist')
      },
      compress: true,
      port: (() => {
        const port = process.env.FRONTEND_PORT || process.env.PORT;
        if (!port) {
          console.error('❌ ERROR: No frontend port specified in environment variables!');
          console.error('Please set FRONTEND_PORT in your .env file');
          process.exit(1);
        }
        console.log(`📁 Using FRONTEND_PORT from .env: ${port}`);
        return parseInt(port);
      })(),
      hot: true,
      open: true,
      historyApiFallback: true
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  };
};
