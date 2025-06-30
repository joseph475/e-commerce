import { h } from 'preact';
import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger', 'warning', 'info'
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: h('svg', { className: "w-6 h-6 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" })
          ),
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: h('svg', { className: "w-6 h-6 text-yellow-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" })
          ),
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
        return {
          icon: h('svg', { className: "w-6 h-6 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
          ),
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default:
        return {
          icon: h('svg', { className: "w-6 h-6 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
          ),
          iconBg: 'bg-gray-100',
          confirmButton: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    onConfirm();
  };

  return h(Modal, { open: isOpen, onClose: onClose, size: "sm" },
    h('div', { className: "p-4" },
      h('div', { className: "flex items-center space-x-4 mb-4" },
        h('div', { className: `flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center` },
          styles.icon
        ),
        h('div', { className: "flex-1" },
          h('h3', { className: "text-lg font-medium text-gray-900" }, title),
          h('p', { className: "text-sm text-gray-500 mt-1" }, message)
        )
      ),
      
      h('div', { className: "flex gap-3 mt-6" },
        h(Button, {
          variant: "outline",
          fullWidth: true,
          onClick: onClose,
          disabled: loading
        }, cancelText),
        h(Button, {
          fullWidth: true,
          onClick: handleConfirm,
          loading: loading,
          className: styles.confirmButton
        }, confirmText)
      )
    )
  );
};

export default ConfirmModal;
