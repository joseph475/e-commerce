import { h } from 'preact';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from '../../pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return h('div', { className: "min-h-screen flex items-center justify-center" },
      h('div', { className: "text-center" },
        h('div', { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" }),
        h('p', { className: "text-gray-600" }, "Loading...")
      )
    );
  }

  if (!user) {
    return h(LoginPage);
  }

  return children;
};

export default ProtectedRoute;
