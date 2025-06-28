# Full-Stack Monorepo Boilerplate

A modern full-stack monorepo boilerplate built with Node.js, Express, Supabase, Preact, Webpack, and Tailwind CSS.

## What is a Monorepo?

A **monorepo** (monolithic repository) is a software development strategy where code for many projects is stored in the same repository. This boilerplate demonstrates the benefits of using a monorepo for full-stack development.

### Benefits of This Monorepo Setup:

1. **Simplified Dependency Management** - Share common dependencies and keep versions synchronized
2. **Code Sharing** - Shared utilities, constants, and configurations between frontend and backend
3. **Atomic Changes** - Make coordinated changes across both frontend and backend in a single commit
4. **Unified Development Workflow** - Single repository to clone, single command to start everything
5. **Better Tooling Integration** - Shared linting, formatting, and build processes

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

## Monorepo Structure

```
fullstack-boilerplate/
├── packages/               # All packages in the monorepo
│   ├── backend/           # Backend application
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── .env.example   # Environment variables template
│   │   ├── package.json   # Backend dependencies
│   │   └── server.js      # Main server file
│   ├── frontend/          # Frontend application
│   │   ├── src/           # Source code
│   │   │   ├── components/ # Preact components
│   │   │   ├── pages/     # Page components
│   │   │   ├── services/  # API and Supabase services
│   │   │   ├── styles/    # CSS styles
│   │   │   └── index.js   # Entry point
│   │   ├── .env.example   # Environment variables template
│   │   ├── package.json   # Frontend dependencies
│   │   ├── webpack.config.js # Webpack configuration
│   │   └── tailwind.config.js # Tailwind configuration
│   └── shared/            # Shared utilities and constants
│       ├── index.js       # Shared utilities
│       └── package.json   # Shared package config
├── .env.example           # Root environment variables
├── .gitignore             # Root gitignore for the entire monorepo
├── package.json           # Root package.json with workspaces
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)
- Supabase account (optional, for database features)

### Installation

1. **Clone or copy this boilerplate to your project directory**

2. **Install all dependencies (monorepo setup)**
   ```bash
   # Install root dependencies and all workspace dependencies
   npm install
   
   # Or install individually if needed
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy root environment file (shared across all packages)
   cp .env.example .env
   
   # Optionally, copy package-specific environment files
   cp packages/backend/.env.example packages/backend/.env
   cp packages/frontend/.env.example packages/frontend/.env
   
   # Edit .env files with your configuration
   # Root .env contains shared variables
   # Package .env files override root variables if needed
   ```

### Environment Configuration

This monorepo uses a **hybrid environment variable approach** that combines the benefits of shared configuration with package-specific overrides.

#### How Environment Variables Work:

1. **Root `.env`** - Contains shared variables used by all packages
2. **Package `.env`** - Contains package-specific variables that override root variables
3. **Precedence**: Package `.env` > Root `.env` > System environment variables

#### Root `.env` (Shared Variables)
```env
# Shared across all packages
NODE_ENV=development
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# Default ports
PORT=8000
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### Package-Specific `.env` (Optional Overrides)

**Backend (`packages/backend/.env`)**
```env
# Override shared variables if needed
BACKEND_PORT=8001  # Use different port for backend

# Backend-specific variables
LOG_LEVEL=debug
DB_POOL_SIZE=10
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (`packages/frontend/.env`)**
```env
# Override shared variables if needed
# REACT_APP_API_URL=http://localhost:8001  # Point to different backend

# Frontend-specific variables
REACT_APP_ENABLE_DEBUG=true
REACT_APP_THEME=light
REACT_APP_VERSION=1.0.0-frontend
```

#### Example Use Cases:

- **Same variable, different values**: Use `PORT=8000` in root, but `PORT=8001` in backend package
- **Package-specific features**: `REACT_APP_ENABLE_DEBUG=true` only in frontend
- **Environment-specific overrides**: Different API URLs for development vs production

### Development

#### Option 1: Start Both Services (Recommended)
```bash
# Start both backend and frontend simultaneously
npm run dev
```
This will start:
- Backend on the port specified by BACKEND_PORT in .env
- Frontend on the port specified by FRONTEND_PORT in .env

#### Option 2: Start Services Individually
```bash
# Start backend only
npm run dev:backend

# Start frontend only (in another terminal)
npm run dev:frontend
```

### Production

#### Build and Start
```bash
# Build frontend for production
npm run build

# Start both services in production mode
npm start
```

#### Individual Production Commands
```bash
# Start backend in production
npm run start:backend

# Start frontend in production (in another terminal)
npm run start:frontend
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

### Root Level (Monorepo Commands)
- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only backend in development mode
- `npm run dev:frontend` - Start only frontend in development mode
- `npm start` - Start both backend and frontend in production mode
- `npm run start:backend` - Start only backend in production mode
- `npm run start:frontend` - Start only frontend in production mode
- `npm run build` - Build frontend for production
- `npm run clean` - Clean frontend build directory
- `npm run install:all` - Install dependencies for all packages
- `npm test` - Run tests for all packages
- `npm run lint` - Run linting for all packages

### Individual Package Scripts
#### Backend (`packages/backend/`)
- `npm run dev --workspace=backend` - Start development server with nodemon
- `npm start --workspace=backend` - Start production server

#### Frontend (`packages/frontend/`)
- `npm run dev --workspace=frontend` - Start development server with hot reload
- `npm start --workspace=frontend` - Start production server
- `npm run build --workspace=frontend` - Build for production
- `npm run clean --workspace=frontend` - Clean build directory

#### Shared (`packages/shared/`)
- Contains shared utilities and constants used by both frontend and backend

## Customization

This monorepo boilerplate is designed to be easily customizable:

1. **Add new API routes** in `packages/backend/routes/`
2. **Add new pages** in `packages/frontend/src/pages/`
3. **Add new components** in `packages/frontend/src/components/`
4. **Add shared utilities** in `packages/shared/index.js`
5. **Modify styling** in `packages/frontend/src/styles/` or `packages/frontend/tailwind.config.js`
6. **Configure Webpack** in `packages/frontend/webpack.config.js`
7. **Share constants and types** between frontend and backend via the `shared` package

### Monorepo Benefits in Action:

- **Shared Utilities**: Both frontend and backend can import from `shared` package
- **Consistent Constants**: WebSocket message types, HTTP status codes, etc. are shared
- **Type Safety**: Share TypeScript types between frontend and backend (if you add TypeScript)
- **Unified Commands**: Single command to start, build, or test everything

## Supabase Setup (Optional)

If you want to use Supabase features:

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update the environment variables in both frontend and backend
4. Create your database tables as needed

## License

This project is open source and available under the [MIT License](LICENSE).
