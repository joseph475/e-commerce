import { h } from 'preact';

const Grid = ({ 
  children, 
  cols = 1,
  gap = 4,
  className = '',
  responsive = true,
  ...props 
}) => {
  const baseClasses = 'grid';
  
  // Responsive grid columns
  const getResponsiveClasses = () => {
    if (!responsive) {
      return `grid-cols-${cols}`;
    }
    
    // Default responsive behavior
    if (typeof cols === 'number') {
      return `grid-cols-1 sm:grid-cols-2 md:grid-cols-${Math.min(cols, 3)} lg:grid-cols-${cols}`;
    }
    
    // Custom responsive object
    if (typeof cols === 'object') {
      const classes = [];
      if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
      return classes.join(' ');
    }
    
    return `grid-cols-${cols}`;
  };

  const gapClass = `gap-${gap}`;

  const classes = [
    baseClasses,
    getResponsiveClasses(),
    gapClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const GridItem = ({ 
  children, 
  colSpan = 1,
  rowSpan = 1,
  className = '',
  ...props 
}) => {
  const classes = [
    colSpan > 1 ? `col-span-${colSpan}` : '',
    rowSpan > 1 ? `row-span-${rowSpan}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

Grid.Item = GridItem;

export default Grid;
