# POS System

A modern, responsive Point of Sale (POS) system built with Node.js, Express, Supabase, Preact, Webpack, and Tailwind CSS.

## Features

### 🏪 Core POS Functionality
- **Product Management**: Add, edit, and manage products with categories and stock tracking
- **Shopping Cart**: Intuitive cart management with quantity adjustments
- **Order Processing**: Complete checkout flow with customer information and payment methods
- **Real-time Updates**: WebSocket integration for live updates
- **Inventory Tracking**: Automatic stock updates and low stock alerts

### 📱 Responsive Design
- **Mobile-First**: Optimized for tablets and mobile devices
- **Desktop Support**: Full-featured desktop interface
- **Adaptive UI**: Components automatically adapt to screen size
- **Touch-Friendly**: Large touch targets for mobile interactions

### 🎨 Modern UI/UX
- **Tailwind CSS**: Utility-first styling for rapid development
- **Headless UI**: Accessible, unstyled UI components
- **Smooth Animations**: Polished transitions and interactions
- **Dark Mode Ready**: Prepared for dark mode implementation

### 🔐 Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin, Manager, and Cashier roles
- **Row Level Security**: Database-level security with Supabase RLS
- **Password Hashing**: Secure password storage with bcrypt

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **WebSocket** - Real-time communication
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **Preact** - Lightweight React alternative
- **Webpack** - Module bundler
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Babel** - JavaScript transpilation

### Development
- **Monorepo Structure** - Organized with workspaces
- **Hot Reload** - Fast development workflow
- **ESLint Ready** - Code quality tools
- **Responsive Design** - Mobile-first approach

## Project Structure

```
pos/
├── packages/
│   ├── backend/                 # Node.js API server
│   │   ├── config/             # Configuration files
│   │   ├── database/           # Database schema and migrations
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/            # API routes
│   │   └── server.js          # Main server file
│   ├── frontend/              # Preact application
│   │   ├── src/
│   │   │   ├── components/    # Reusable components
│   │   │   │   ├── ui/       # Base UI components
│   │   │   │   ├── pos/      # POS-specific components
│   │   │   │   └── layout/   # Layout components
│   │   │   ├── pages/        # Page components
│   │   │   ├── services/     # API services
│   │   │   └── styles/       # CSS styles
│   │   └── webpack.config.js  # Webpack configuration
│   └── shared/               # Shared utilities
└── package.json             # Root package configuration
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Copy the example files:
   ```bash
   cp .env.example .env
   cp packages/backend/.env.example packages/backend/.env
   cp packages/frontend/.env.example packages/frontend/.env
   ```

4. **Configure Supabase**
   
   Update the environment files with your Supabase credentials:
   ```env
   # Backend .env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   BACKEND_PORT=8003
   
   # Frontend .env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_API_URL=http://localhost:8003
   ```

5. **Set up the database**
   
   Run the SQL schema in your Supabase SQL editor:
   ```bash
   # Copy the contents of packages/backend/database/schema.sql
   # and run it in your Supabase project's SQL editor
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API server on http://localhost:8003
   - Frontend development server on http://localhost:3000

## Usage

### Accessing the POS System

1. **Dashboard**: Visit http://localhost:3000 for the main dashboard with business analytics
2. **POS Interface**: Visit http://localhost:3000/pos for the main POS system

### Default Accounts

The database schema includes sample user entries, but you need to create actual accounts. You can:

**Option 1: Register new accounts via API**
```bash
# Register an admin account
curl -X POST http://localhost:8003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pos.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "admin"
  }'

# Register a cashier account
curl -X POST http://localhost:8003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cashier@pos.com", 
    "password": "cashier123",
    "full_name": "Cashier User",
    "role": "cashier"
  }'
```

**Option 2: Update the schema with real password hashes**
The sample users in the schema have placeholder hashes. Replace `$2a$10$example_hash_here` with actual bcrypt hashes.

### Mobile vs Desktop Experience

#### Mobile Features
- **Tab Navigation**: Switch between Products and Cart views
- **Touch-Optimized**: Large buttons and touch targets
- **Swipe Gestures**: Natural mobile interactions
- **Compact Layout**: Optimized for small screens

#### Desktop Features
- **Split View**: Products and cart side-by-side
- **Keyboard Shortcuts**: Efficient keyboard navigation
- **Hover States**: Rich hover interactions
- **Multi-Column Layout**: Better use of screen space

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/products/categories/list` - Get product categories

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/orders/stats/summary` - Get order statistics

## Component Architecture

### Reusable UI Components

#### Base Components
- **Button**: Flexible button with variants and sizes
- **Input**: Form input with validation and icons
- **Card**: Container component with consistent styling
- **Grid**: Responsive grid layout system

#### Layout Components
- **ResponsiveLayout**: Handles mobile/desktop rendering
- **MobileView/DesktopView**: Conditional rendering helpers

#### POS Components
- **ProductGrid**: Responsive product display
- **Cart**: Shopping cart with mobile/desktop variants
- **CheckoutModal**: Order completion flow

### Responsive Design Patterns

```jsx
// Example: Responsive component usage
<ResponsiveLayout
  mobileComponent={<MobileProductGrid />}
  desktopComponent={<DesktopProductGrid />}
/>

// Example: Conditional rendering
<ResponsiveLayout.Mobile>
  <MobileSpecificComponent />
</ResponsiveLayout.Mobile>

<ResponsiveLayout.Desktop>
  <DesktopSpecificComponent />
</ResponsiveLayout.Desktop>
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Production
npm run build           # Build frontend for production
npm run start           # Start production servers

# Utilities
npm run clean           # Clean build artifacts
npm run lint            # Run linting
npm run test            # Run tests
```

### Adding New Components

1. **Create the component file**
   ```jsx
   // packages/frontend/src/components/ui/NewComponent.jsx
   import { h } from 'preact';
   
   const NewComponent = ({ children, ...props }) => {
     return (
       <div {...props}>
         {children}
       </div>
     );
   };
   
   export default NewComponent;
   ```

2. **Export from index**
   ```js
   // packages/frontend/src/components/ui/index.js
   export { default as NewComponent } from './NewComponent.jsx';
   ```

3. **Use in other components**
   ```jsx
   import { NewComponent } from '../components/ui';
   ```

### Responsive Component Guidelines

1. **Mobile-First Design**: Start with mobile layout, then enhance for desktop
2. **Separate Components**: Create distinct mobile/desktop components when layouts differ significantly
3. **Shared Logic**: Extract business logic into custom hooks
4. **Touch Targets**: Ensure minimum 44px touch targets on mobile
5. **Performance**: Lazy load desktop-specific features

## Database Schema

The system uses the following main tables:

- **users**: User accounts and authentication
- **products**: Product catalog with inventory
- **orders**: Customer orders and transactions
- **order_items**: Individual items within orders
- **inventory_transactions**: Stock movement tracking

See `packages/backend/database/schema.sql` for the complete schema.

## Deployment

### Backend Deployment
1. Set up a Node.js hosting service (Heroku, Railway, etc.)
2. Configure environment variables
3. Deploy the backend package

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to a static hosting service
3. Configure API URL environment variable

### Database Setup
1. Create a Supabase project
2. Run the schema SQL in the Supabase SQL editor
3. Configure Row Level Security policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the component examples in `/test`

---

Built with ❤️ using modern web technologies for a fast, responsive, and accessible POS experience.
