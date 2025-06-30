import { h } from 'preact';
import { useEffect } from 'preact/hooks';

const Modal = ({ 
  isOpen, 
  open,
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  className = ''
}) => {
  // Support both 'isOpen' and 'open' props for flexibility
  const modalOpen = isOpen !== undefined ? isOpen : open;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        onClose();
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen, onClose]);

  if (!modalOpen) return null;

  return h('div', { className: "fixed inset-0 z-50 overflow-y-auto" },
    // Backdrop
    h('div', { 
      className: "fixed inset-0 bg-black bg-opacity-25 transition-opacity",
      onClick: onClose
    }),
    
    // Modal
    h('div', { className: "flex min-h-full items-center justify-center p-4" },
      h('div', { 
        className: `relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all ${className}`,
        onClick: (e) => e.stopPropagation()
      },
        (title || showCloseButton) && h('div', { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200" },
          title && h('h3', { className: "text-lg font-medium leading-6 text-gray-900" }, title),
          showCloseButton && h('button', {
            type: "button",
            className: "rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            onClick: onClose
          },
            h('span', { className: "sr-only" }, "Close"),
            h('svg', { className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
            )
          )
        ),
        
        h('div', { className: title || showCloseButton ? '' : 'p-6' }, children)
      )
    )
  );
};

export default Modal;
