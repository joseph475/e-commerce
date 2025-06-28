import { h, Fragment } from 'preact';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const Menu = ({ 
  trigger, 
  children, 
  align = 'left',
  width = 'w-56'
}) => {
  const alignmentClasses = {
    left: 'origin-top-left left-0',
    right: 'origin-top-right right-0',
    center: 'origin-top left-1/2 transform -translate-x-1/2'
  };

  return (
    <HeadlessMenu as="div" className="relative inline-block text-left">
      <div>
        <HeadlessMenu.Button className="inline-flex w-full justify-center items-center">
          {trigger}
        </HeadlessMenu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessMenu.Items 
          className={`absolute z-10 mt-2 ${width} ${alignmentClasses[align]} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1">
            {children}
          </div>
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );
};

const MenuItem = ({ 
  children, 
  onClick, 
  href, 
  disabled = false,
  icon: Icon,
  variant = 'default'
}) => {
  const baseClasses = "group flex items-center px-4 py-2 text-sm w-full text-left";
  const variantClasses = {
    default: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
    danger: "text-red-700 hover:bg-red-50 hover:text-red-900",
    success: "text-green-700 hover:bg-green-50 hover:text-green-900"
  };
  
  const disabledClasses = disabled 
    ? "text-gray-400 cursor-not-allowed" 
    : variantClasses[variant];

  const content = (
    <>
      {Icon && (
        <Icon 
          className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" 
          aria-hidden="true" 
        />
      )}
      {children}
    </>
  );

  return (
    <HeadlessMenu.Item disabled={disabled}>
      {({ active }) => (
        href ? (
          <a
            href={href}
            className={`${baseClasses} ${active ? disabledClasses : disabledClasses}`}
          >
            {content}
          </a>
        ) : (
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${active ? disabledClasses : disabledClasses}`}
          >
            {content}
          </button>
        )
      )}
    </HeadlessMenu.Item>
  );
};

// Simple trigger button component
const MenuTrigger = ({ children, className = "" }) => (
  <div className={`btn btn-secondary ${className}`}>
    {children}
    <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
  </div>
);

Menu.Item = MenuItem;
Menu.Trigger = MenuTrigger;

export default Menu;
