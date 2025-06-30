import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Grid from '../ui/Grid';
import ResponsiveLayout from '../layout/ResponsiveLayout';
import { formatCurrency } from '../../utils/currency';

const ProductCard = ({ product, onAddToCart, view = 'desktop' }) => {
  const isMobile = view === 'mobile';
  const isTablet = view === 'tablet';
  
  return (
    <Card 
      hover 
      padding="none"
      className="cursor-pointer transition-all duration-200 overflow-hidden"
      onClick={() => onAddToCart(product)}
    >
      <div className="aspect-square relative overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Overlay with product info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {/* Glossy blurred background */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg"></div>
            
            {/* Content */}
            <div className="relative">
              <h3 className="font-semibold text-white line-clamp-1 text-sm mb-1 drop-shadow-sm">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base drop-shadow-sm">
                  {formatCurrency(product.price)}
                </span>
                
                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                  <span className="text-xs text-orange-200 bg-orange-500/80 px-2 py-1 rounded backdrop-blur-sm">
                    Low Stock
                  </span>
                )}
                
                {product.stock_quantity === 0 && (
                  <span className="text-xs text-red-200 bg-red-500/80 px-2 py-1 rounded backdrop-blur-sm">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const MobileProductGrid = ({ products, onAddToCart, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <Grid cols={2} gap={3} responsive={false}>
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
            view="mobile"
          />
        ))}
      </Grid>
    </div>
  );
};

const DesktopProductGrid = ({ products, onAddToCart, loading }) => {
  if (loading) {
    return (
      <div className="p-6">
        <Grid cols={3} gap={6}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square"></div>
          ))}
        </Grid>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Grid cols={{ md: 2, lg: 4, xl: 5 }} gap={3}>
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
            view="desktop"
          />
        ))}
      </Grid>
    </div>
  );
};

const ProductGrid = ({ products = [], onAddToCart, loading = false }) => {
  // Debug logging
  console.log('ProductGrid - products:', products);
  console.log('ProductGrid - loading:', loading);
  console.log('ProductGrid - products length:', products.length);
  
  // Log first product to see structure
  if (products.length > 0) {
    console.log('ProductGrid - first product:', products[0]);
    console.log('ProductGrid - product keys:', Object.keys(products[0]));
  }

  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-lg font-medium">No products available</p>
        <p className="text-sm">Products will appear here when they are loaded</p>
      </div>
    );
  }

  return (
    <ResponsiveLayout
      mobileComponent={
        <MobileProductGrid 
          products={products} 
          onAddToCart={onAddToCart} 
          loading={loading}
        />
      }
      desktopComponent={
        <DesktopProductGrid 
          products={products} 
          onAddToCart={onAddToCart} 
          loading={loading}
        />
      }
    />
  );
};

export default ProductGrid;
