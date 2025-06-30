import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const Toast = ({ 
  isOpen, 
  onClose, 
  message, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  duration = 3000,
  position = 'top-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center'
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-400',
          text: 'text-green-800',
          iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          text: 'text-red-800',
          iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          text: 'text-yellow-800',
          iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          text: 'text-blue-800',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-400',
          text: 'text-gray-800',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const styles = getTypeStyles();

  return h('div', { 
    className: `fixed ${getPositionStyles()} z-50 max-w-sm w-full animate-in slide-in-from-top-2 duration-300`
  },
    h('div', { 
      className: `rounded-lg border p-4 shadow-lg backdrop-blur-sm ${styles.bg}`
    },
      h('div', { className: "flex items-start" },
        h('div', { className: "flex-shrink-0" },
          h('svg', { 
            className: `h-5 w-5 ${styles.icon}`, 
            fill: "none", 
            stroke: "currentColor", 
            viewBox: "0 0 24 24" 
          },
            h('path', { 
              strokeLinecap: "round", 
              strokeLinejoin: "round", 
              strokeWidth: 2, 
              d: styles.iconPath 
            })
          )
        ),
        h('div', { className: "ml-3 flex-1" },
          h('p', { className: `text-sm font-medium ${styles.text}` }, message)
        ),
        h('div', { className: "ml-4 flex-shrink-0" },
          h('button', {
            onClick: onClose,
            className: `inline-flex rounded-md ${styles.bg} ${styles.text} hover:${styles.text} focus:outline-none focus:ring-2 focus:ring-offset-2`
          },
            h('span', { className: "sr-only" }, "Close"),
            h('svg', { className: "h-5 w-5", fill: "currentColor", viewBox: "0 0 20 20" },
              h('path', { 
                fillRule: "evenodd", 
                d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                clipRule: "evenodd" 
              })
            )
          )
        )
      )
    )
  );
};

export default Toast;
