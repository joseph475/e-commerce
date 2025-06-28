import { h } from 'preact';
import { Switch } from '@headlessui/react';

const Toggle = ({ 
  enabled, 
  onChange, 
  label,
  description,
  disabled = false,
  size = 'md',
  className = ""
}) => {
  const sizeClasses = {
    sm: {
      switch: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: enabled ? 'translate-x-3' : 'translate-x-0'
    },
    md: {
      switch: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: enabled ? 'translate-x-5' : 'translate-x-0'
    },
    lg: {
      switch: 'h-8 w-14',
      thumb: 'h-7 w-7',
      translate: enabled ? 'translate-x-6' : 'translate-x-0'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {(label || description) && (
        <div className="flex-1 mr-4">
          {label && (
            <Switch.Label 
              as="p" 
              className={`text-sm font-medium text-gray-900 ${disabled ? 'text-gray-400' : ''}`}
              passive
            >
              {label}
            </Switch.Label>
          )}
          {description && (
            <Switch.Description 
              as="p" 
              className={`text-sm text-gray-500 ${disabled ? 'text-gray-300' : ''}`}
            >
              {description}
            </Switch.Description>
          )}
        </div>
      )}
      
      <Switch
        checked={enabled}
        onChange={onChange}
        disabled={disabled}
        className={`${
          enabled ? 'bg-primary-600' : 'bg-gray-200'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } relative inline-flex ${currentSize.switch} shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">{label || 'Toggle setting'}</span>
        <span
          aria-hidden="true"
          className={`${currentSize.translate} pointer-events-none inline-block ${currentSize.thumb} transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  );
};

export default Toggle;
