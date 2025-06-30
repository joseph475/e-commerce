import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import AppLayout from '../components/layout/AppLayout';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useCache } from '../hooks/useCache';
import globalCache from '../utils/globalCache';

const UserForm = ({ isOpen, onClose, user, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'cashier'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '', // Never pre-fill password
        full_name: user.full_name || '',
        role: user.role || 'cashier'
      });
    } else {
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'cashier'
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return h(Modal, { open: isOpen, onClose: onClose, size: "md" },
    h('div', { className: "p-6" },
      h('h2', { className: "text-xl font-semibold text-gray-900 mb-6" }, 
        user ? 'Edit User' : 'Add New User'
      ),
      
      h('form', { onSubmit: handleSubmit, className: "space-y-4" },
        h(Input, {
          label: "Full Name",
          value: formData.full_name,
          onChange: (e) => handleInputChange('full_name', e.target.value),
          required: true,
          fullWidth: true
        }),
        
        h(Input, {
          label: "Email",
          type: "email",
          value: formData.email,
          onChange: (e) => handleInputChange('email', e.target.value),
          required: true,
          fullWidth: true
        }),
        
        !user && h(Input, {
          label: "Password",
          type: "password",
          value: formData.password,
          onChange: (e) => handleInputChange('password', e.target.value),
          required: !user,
          fullWidth: true,
          placeholder: user ? "Leave blank to keep current password" : "Enter password"
        }),
        
        h('div', null,
          h('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Role"),
          h('select', {
            value: formData.role,
            onChange: (e) => handleInputChange('role', e.target.value),
            className: "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          },
            h('option', { value: "cashier" }, "Cashier"),
            h('option', { value: "admin" }, "Admin")
          )
        ),
        
        h('div', { className: "flex gap-3 pt-4 border-t border-gray-200" },
          h(Button, {
            type: "button",
            variant: "outline",
            fullWidth: true,
            onClick: onClose,
            disabled: loading
          }, "Cancel"),
          h(Button, {
            type: "submit",
            fullWidth: true,
            loading: loading
          }, user ? 'Update User' : 'Create User')
        )
      )
    )
  );
};

const PasswordResetModal = ({ isOpen, onClose, user, onSubmit, loading }) => {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newPassword);
  };

  if (!user) return null;

  return h(Modal, { open: isOpen, onClose: onClose, size: "sm" },
    h('div', { className: "p-6" },
      h('h2', { className: "text-xl font-semibold text-gray-900 mb-4" }, 
        `Reset Password: ${user.full_name}`
      ),
      
      h('form', { onSubmit: handleSubmit, className: "space-y-4" },
        h(Input, {
          label: "New Password",
          type: "password",
          value: newPassword,
          onChange: (e) => setNewPassword(e.target.value),
          required: true,
          fullWidth: true,
          placeholder: "Enter new password"
        }),
        
        h('div', { className: "flex gap-3 pt-4" },
          h(Button, {
            type: "button",
            variant: "outline",
            fullWidth: true,
            onClick: onClose,
            disabled: loading
          }, "Cancel"),
          h(Button, {
            type: "submit",
            fullWidth: true,
            loading: loading
          }, "Reset Password")
        )
      )
    )
  );
};

const UserCard = ({ user, currentUserId, onEdit, onResetPassword, onToggleStatus, onDelete }) => {
  const isCurrentUser = user.id === currentUserId;
  const userDate = new Date(user.created_at);
  const lastLoginDate = user.last_login ? new Date(user.last_login) : null;

  return h(Card, { className: "p-4" },
    h('div', { className: "flex items-start justify-between mb-3" },
      h('div', { className: "flex items-center space-x-3" },
        h('div', { className: "w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center" },
          h('span', { className: "text-white text-sm font-medium" }, 
            user.full_name.charAt(0).toUpperCase()
          )
        ),
        h('div', null,
          h('h3', { className: "font-semibold text-gray-900" }, user.full_name),
          h('p', { className: "text-sm text-gray-600" }, user.email),
          h('div', { className: "flex items-center gap-2 mt-1" },
            h('span', { 
              className: `px-2 py-1 text-xs font-medium rounded ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`
            }, user.role.charAt(0).toUpperCase() + user.role.slice(1)),
            h('span', { 
              className: `px-2 py-1 text-xs font-medium rounded ${
                user.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`
            }, user.active ? 'Active' : 'Inactive'),
            isCurrentUser && h('span', { 
              className: "px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800"
            }, "You")
          )
        )
      ),
      
      // Action buttons
      h('div', { className: "flex gap-1" },
        h('button', {
          onClick: () => onEdit(user),
          className: "p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors",
          title: "Edit user"
        },
          h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" })
          )
        ),
        h('button', {
          onClick: () => onResetPassword(user),
          className: "p-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors",
          title: "Reset password"
        },
          h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" })
          )
        ),
        !isCurrentUser && h('button', {
          onClick: () => onToggleStatus(user),
          className: `p-1.5 rounded transition-colors ${
            user.active 
              ? "text-gray-600 hover:text-red-600 hover:bg-red-50" 
              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
          }`,
          title: user.active ? "Deactivate user" : "Activate user"
        },
          user.active ? 
            h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" })
            ) :
            h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" })
            )
        ),
        !isCurrentUser && h('button', {
          onClick: () => onDelete(user.id),
          className: "p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors",
          title: "Delete user"
        },
          h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" })
          )
        )
      )
    ),

    h('div', { className: "space-y-2 text-sm text-gray-600" },
      h('div', { className: "flex justify-between" },
        h('span', null, "Created:"),
        h('span', null, userDate.toLocaleDateString())
      ),
      lastLoginDate && h('div', { className: "flex justify-between" },
        h('span', null, "Last Login:"),
        h('span', null, lastLoginDate.toLocaleDateString())
      )
    )
  );
};

const MobileUserLayout = ({ 
  users, 
  loading, 
  searchTerm, 
  onSearchChange, 
  roleFilter, 
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  currentUserId,
  onAddUser,
  onEditUser,
  onResetPassword,
  onToggleStatus,
  onDeleteUser
}) => {
  return h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },
    // Search and Filters
    h('div', { className: "bg-white border-b border-gray-200 p-4 space-y-4" },
      h(Input, {
        placeholder: "Search users...",
        value: searchTerm,
        onChange: (e) => onSearchChange(e.target.value),
        fullWidth: true,
        leftIcon: h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
          h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
        )
      }),
      h('div', { className: "flex gap-2" },
        h('select', {
          value: roleFilter,
          onChange: (e) => onRoleFilterChange(e.target.value),
          className: "flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        },
          h('option', { value: "all" }, "All Roles"),
          h('option', { value: "admin" }, "Admin"),
          h('option', { value: "cashier" }, "Cashier")
        ),
        h('select', {
          value: statusFilter,
          onChange: (e) => onStatusFilterChange(e.target.value),
          className: "flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        },
          h('option', { value: "all" }, "All Status"),
          h('option', { value: "active" }, "Active"),
          h('option', { value: "inactive" }, "Inactive")
        )
      ),
      h(Button, {
        onClick: onAddUser,
        fullWidth: true
      }, "Add User")
    ),

    // Users List
    h('div', { className: "flex-1 overflow-y-auto p-4" },
      loading ? 
        h('div', { className: "space-y-4" },
          [...Array(6)].map((_, i) => 
            h('div', { key: i, className: "bg-gray-200 animate-pulse rounded-lg h-32" })
          )
        ) :
        users.length > 0 ?
          h('div', { className: "space-y-4" },
            users.map(user => 
              h(UserCard, {
                key: user.id,
                user: user,
                currentUserId: currentUserId,
                onEdit: onEditUser,
                onResetPassword: onResetPassword,
                onToggleStatus: onToggleStatus,
                onDelete: onDeleteUser
              })
            )
          ) :
          h('div', { className: "text-center py-12" },
            h('svg', { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" })
            ),
            h('h3', { className: "mt-2 text-sm font-medium text-gray-900" }, "No users found"),
            h('p', { className: "mt-1 text-sm text-gray-500" }, "No users match your search criteria.")
          )
    )
  );
};

const DesktopUserLayout = ({ 
  users, 
  loading, 
  searchTerm, 
  onSearchChange, 
  roleFilter, 
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  currentUserId,
  onAddUser,
  onEditUser,
  onResetPassword,
  onToggleStatus,
  onDeleteUser
}) => {
  return h('div', { className: "flex flex-col bg-gray-50 h-[calc(100vh-4rem)]" },
    // Search and Filters
    h('div', { className: "bg-white border-b border-gray-200 p-6" },
      h('div', { className: "flex gap-4 items-center" },
        h('div', { className: "flex-1" },
          h(Input, {
            placeholder: "Search users by name or email...",
            value: searchTerm,
            onChange: (e) => onSearchChange(e.target.value),
            fullWidth: true,
            leftIcon: h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
            )
          })
        ),
        h('select', {
          value: roleFilter,
          onChange: (e) => onRoleFilterChange(e.target.value),
          className: "border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        },
          h('option', { value: "all" }, "All Roles"),
          h('option', { value: "admin" }, "Admin"),
          h('option', { value: "cashier" }, "Cashier")
        ),
        h('select', {
          value: statusFilter,
          onChange: (e) => onStatusFilterChange(e.target.value),
          className: "border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        },
          h('option', { value: "all" }, "All Status"),
          h('option', { value: "active" }, "Active"),
          h('option', { value: "inactive" }, "Inactive")
        ),
        h(Button, {
          onClick: onAddUser
        }, "Add User")
      )
    ),

    // Users Content
    h('div', { className: "flex-1 overflow-y-auto p-6" },
      loading ? 
        h('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
          [...Array(9)].map((_, i) => 
            h('div', { key: i, className: "bg-gray-200 animate-pulse rounded-lg h-48" })
          )
        ) :
        users.length > 0 ?
          h('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
            users.map(user => 
              h(UserCard, {
                key: user.id,
                user: user,
                currentUserId: currentUserId,
                onEdit: onEditUser,
                onResetPassword: onResetPassword,
                onToggleStatus: onToggleStatus,
                onDelete: onDeleteUser
              })
            )
          ) :
          h('div', { className: "text-center py-12" },
            h('svg', { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
              h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" })
            ),
            h('h3', { className: "mt-2 text-sm font-medium text-gray-900" }, "No users found"),
            h('p', { className: "mt-1 text-sm text-gray-500" }, "No users match your search criteria.")
          )
    )
  );
};

const UserManagementPage = () => {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  // Fetch users directly (bypass cache for debugging)
  const fetchUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      console.log('Fetching users with token:', token.substring(0, 20) + '...');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      setUsers(result.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setToast({ isOpen: true, message: 'Error fetching users: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.active) ||
                         (statusFilter === 'inactive' && !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async (formData) => {
    setFormLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      // Add user to local state and refresh
      setUsers(prev => [result.data, ...prev]);
      
      setShowUserForm(false);
      setSelectedUser(null);
      setToast({ isOpen: true, message: 'User created successfully!', type: 'success' });
    } catch (error) {
      console.error('Error creating user:', error);
      setToast({ isOpen: true, message: 'Error creating user: ' + error.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (formData) => {
    setFormLoading(true);
    try {
      const { password, ...updateData } = formData; // Remove password from update data
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      // Update user in local state
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? result.data : u));
      
      setShowUserForm(false);
      setSelectedUser(null);
      setToast({ isOpen: true, message: 'User updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating user:', error);
      setToast({ isOpen: true, message: 'Error updating user: ' + error.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    setFormLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${selectedUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password');
      }

      setShowPasswordReset(false);
      setSelectedUser(null);
      setToast({ isOpen: true, message: 'Password reset successfully!', type: 'success' });
    } catch (error) {
      console.error('Error resetting password:', error);
      setToast({ isOpen: true, message: 'Error resetting password: ' + error.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !user.active })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user status');
      }

      // Update user in local state
      setUsers(prev => prev.map(u => u.id === user.id ? result.data : u));
      
      setToast({ 
        isOpen: true, 
        message: `User ${user.active ? 'deactivated' : 'activated'} successfully!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      setToast({ isOpen: true, message: 'Error updating user status: ' + error.message, type: 'error' });
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setFormLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Remove user from local state
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setToast({ isOpen: true, message: 'User deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setToast({ isOpen: true, message: 'Error deleting user: ' + error.message, type: 'error' });
    } finally {
      setFormLoading(false);
    }
  };

  return h('div', null,
    h(AppLayout, { currentPath: "/users" },
      h(ResponsiveLayout, {
        mobileComponent: h(MobileUserLayout, {
          users: filteredUsers,
          loading: loading,
          searchTerm: searchTerm,
          onSearchChange: setSearchTerm,
          roleFilter: roleFilter,
          onRoleFilterChange: setRoleFilter,
          statusFilter: statusFilter,
          onStatusFilterChange: setStatusFilter,
          currentUserId: currentUser?.id,
          onAddUser: () => {
            setSelectedUser(null);
            setShowUserForm(true);
          },
          onEditUser: (user) => {
            setSelectedUser(user);
            setShowUserForm(true);
          },
          onResetPassword: (user) => {
            setSelectedUser(user);
            setShowPasswordReset(true);
          },
          onToggleStatus: handleToggleStatus,
          onDeleteUser: handleDeleteUser
        }),
        desktopComponent: h(DesktopUserLayout, {
          users: filteredUsers,
          loading: loading,
          searchTerm: searchTerm,
          onSearchChange: setSearchTerm,
          roleFilter: roleFilter,
          onRoleFilterChange: setRoleFilter,
          statusFilter: statusFilter,
          onStatusFilterChange: setStatusFilter,
          currentUserId: currentUser?.id,
          onAddUser: () => {
            setSelectedUser(null);
            setShowUserForm(true);
          },
          onEditUser: (user) => {
            setSelectedUser(user);
            setShowUserForm(true);
          },
          onResetPassword: (user) => {
            setSelectedUser(user);
            setShowPasswordReset(true);
          },
          onToggleStatus: handleToggleStatus,
          onDeleteUser: handleDeleteUser
        })
      })
    ),

    // Modals
    h(UserForm, {
      isOpen: showUserForm,
      onClose: () => {
        setShowUserForm(false);
        setSelectedUser(null);
      },
      user: selectedUser,
      onSubmit: selectedUser ? handleUpdateUser : handleCreateUser,
      loading: formLoading
    }),

    h(PasswordResetModal, {
      isOpen: showPasswordReset,
      onClose: () => {
        setShowPasswordReset(false);
        setSelectedUser(null);
      },
      user: selectedUser,
      onSubmit: handleResetPassword,
      loading: formLoading
    }),

    h(ConfirmModal, {
      isOpen: showDeleteConfirm,
      onClose: () => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      },
      onConfirm: confirmDeleteUser,
      title: "Delete User",
      message: userToDelete ? `Are you sure you want to delete "${userToDelete.full_name}"? This action cannot be undone.` : "",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      loading: formLoading
    }),

    h(Toast, {
      isOpen: toast.isOpen,
      onClose: () => setToast({ ...toast, isOpen: false }),
      message: toast.message,
      type: toast.type
    })
  );
};

export default UserManagementPage;
