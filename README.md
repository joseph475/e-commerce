# Full-Stack Boilerplate

A modern full-stack boilerplate built with Node.js, Express, Supabase, Preact, Webpack, and Tailwind CSS.

## Technology Stack

### Backend (`be/`)
- **Node.js** with Express framework
- **Supabase** for database and authentication
- **JWT** for token-based authentication
- **WebSocket** support for real-time features
- **CORS** enabled for cross-origin requests

### Frontend (`fe/`)
- **Preact** for lightweight React-like experience
- **Webpack** for module bundling and optimization
- **Tailwind CSS** for utility-first styling
- **Babel** for JavaScript transpilation
- **Hot reload** for development

## Project Structure

```
boilerplate/
├── be/                     # Backend application
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── .env.example      # Environment variables template
│   ├── package.json      # Backend dependencies
│   └── server.js         # Main server file
├── fe/                    # Frontend application
│   ├── src/              # Source code
│   │   ├── components/   # Preact components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API and Supabase services
│   │   ├── styles/       # CSS styles
│   │   └── index.js      # Entry point
│   ├── public/           # Static assets (created after build)
│   ├── .env.example      # Environment variables template
│   ├── package.json      # Frontend dependencies
│   ├── webpack.config.js # Webpack configuration
│   └── tailwind.config.js # Tailwind configuration
└── README.md             # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- Supabase account (optional, for database features)

### Quick Setup

1. **Clone or copy this boilerplate to your project directory**

2. **Install all dependencies** (from root directory)
   ```bash
   npm run install:all
   ```

3. **Set up environment files**
   ```bash
   # Backend
   cd be
   cp .env.example .env
   # Edit .env with your configuration
   
   # Frontend
   cd ../fe
   cp .env.example .env
   # Edit .env with your configuration
   cd ..
   ```

### Manual Setup (Alternative)

If you prefer to set up each part manually:

1. **Set up the Backend**
   ```bash
   cd be
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   ```

2. **Set up the Frontend**
   ```bash
   cd ../fe
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   ```

### Environment Configuration

#### Backend (.env)
```env
PORT=8000
NODE_ENV=development
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NODE_ENV=development
```

### Development

#### Option 1: Start Both Services Together (Recommended)
```bash
# From root directory
npm run dev
```
This will start both frontend and backend concurrently.

#### Option 2: Start Services Separately
1. **Start the Backend** (in `be/` directory)
   ```bash
   npm run dev
   ```
   The backend will run on http://localhost:8000

2. **Start the Frontend** (in `fe/` directory)
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:3000

#### Option 3: Start from Root Directory
```bash
# Start backend only
npm run dev:be

# Start frontend only  
npm run dev:fe
```

### Production Build

1. **Build the Frontend**
   ```bash
   cd fe
   npm run build
   ```

2. **Start Production Servers**
   ```bash
   # Backend
   cd be
   npm start

   # Frontend (in another terminal)
   cd fe
   npm start
   ```

## Features

### Backend Features
- ✅ Express.js server with CORS
- ✅ Supabase integration
- ✅ JWT authentication middleware
- ✅ WebSocket support
- ✅ Health check endpoints
- ✅ Environment-based configuration

### Frontend Features
- ✅ Preact with JSX support
- ✅ Webpack dev server with hot reload
- ✅ Tailwind CSS with custom configuration
- ✅ API service with error handling
- ✅ Supabase client integration
- ✅ Responsive design
- ✅ WebSocket client
- ✅ Test page for API endpoints

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /api/test/health` - Health check endpoint
- `GET /api/test/supabase` - Supabase connection test

## Available Scripts

### Root Directory
- `npm run install:all` - Install dependencies for root, frontend, and backend
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:fe` - Start only frontend in development mode
- `npm run dev:be` - Start only backend in development mode
- `npm run start` - Start both frontend and backend in production mode
- `npm run start:fe` - Start only frontend in production mode
- `npm run start:be` - Start only backend in production mode
- `npm run build` - Build frontend for production
- `npm run clean` - Clean frontend build directory

### Backend (`be/`)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run dev:watch` - Start development server with file watching
- `npm run prod` - Start production server with NODE_ENV=production

### Frontend (`fe/`)
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload and auto-open browser
- `npm run build` - Build for production (with clean)
- `npm run clean` - Clean build directory
- `npm run preview` - Build and start production server

## Customization

This boilerplate is designed to be easily customizable:

1. **Add new API routes** in `be/routes/`
2. **Add new pages** in `fe/src/pages/`
3. **Add new components** in `fe/src/components/`
4. **Modify styling** in `fe/src/styles/` or `fe/tailwind.config.js`
5. **Configure Webpack** in `fe/webpack.config.js`

## Supabase Setup (Optional)

If you want to use Supabase features:

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update the environment variables in both frontend and backend
4. Create your database tables as needed

## License

This project is open source and available under the [MIT License](LICENSE).
