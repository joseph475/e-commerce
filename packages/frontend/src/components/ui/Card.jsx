import { h } from 'preact';

const Card = ({ 
  children, 
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = true,
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-white';
  
  const paddings = {
    none: '',
    sm: 'p-2 sm:p-3',
    md: 'p-3 sm:p-4 md:p-5',
    lg: 'p-4 sm:p-5 md:p-6',
    xl: 'p-6 sm:p-7 md:p-8'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundeds = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };

  const classes = [
    baseClasses,
    paddings[padding],
    shadows[shadow],
    roundeds[rounded],
    border ? 'border border-gray-200' : '',
    hover ? 'hover:shadow-lg transition-shadow duration-200' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-b border-gray-200 pb-3 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-t border-gray-200 pt-3 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
