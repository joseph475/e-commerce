import { h } from 'preact';
import { Menu } from '../ui';
import { 
  UserCircleIcon,
  CogIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const UserMenu = ({ user, onSettings, onReports, onTimesheet, onLogout }) => {
  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const trigger = (
    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {userInitials}
      </div>
      <div className="hidden sm:block text-left">
        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
        <p className="text-xs text-gray-500">{user?.role || 'Cashier'}</p>
      </div>
    </div>
  );

  return (
    <Menu trigger={trigger} align="right" width="w-64">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
        <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
        <p className="text-xs text-gray-400 mt-1">
          Shift: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <Menu.Item 
        onClick={() => console.log('View Profile')}
        icon={UserCircleIcon}
      >
        View Profile
      </Menu.Item>

      <Menu.Item 
        onClick={onTimesheet}
        icon={ClockIcon}
      >
        Timesheet
      </Menu.Item>

      <div className="border-t border-gray-100 my-1" />

      <Menu.Item 
        onClick={onReports}
        icon={ChartBarIcon}
      >
        Sales Reports
      </Menu.Item>

      <Menu.Item 
        onClick={() => console.log('Transaction History')}
        icon={DocumentTextIcon}
      >
        Transaction History
      </Menu.Item>

      <div className="border-t border-gray-100 my-1" />

      <Menu.Item 
        onClick={onSettings}
        icon={CogIcon}
      >
        Settings
      </Menu.Item>

      <Menu.Item 
        onClick={onLogout}
        icon={ArrowRightOnRectangleIcon}
        variant="danger"
      >
        Sign Out
      </Menu.Item>
    </Menu>
  );
};

export default UserMenu;
