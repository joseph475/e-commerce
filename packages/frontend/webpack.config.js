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
          }
        ]
      }),
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
