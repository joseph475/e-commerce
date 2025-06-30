import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setError(error.message || 'Login failed');
      } else {
        // Redirect to POS page after successful login
        window.location.href = '/pos';
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email, password) => {
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message || 'Demo login failed');
      } else {
        // Redirect to POS page after successful login
        window.location.href = '/pos';
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return h('div', { className: "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" },
    h('div', { className: "sm:mx-auto sm:w-full sm:max-w-md" },
      h('div', { className: "text-center" },
        h('h2', { className: "mt-6 text-3xl font-extrabold text-gray-900" }, "Sign in to POS System"),
        h('p', { className: "mt-2 text-sm text-gray-600" }, "Access your point of sale dashboard")
      )
    ),

    h('div', { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md" },
      h('div', { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10" },
        h('form', { className: "space-y-6", onSubmit: handleSubmit },
          h('div', null,
            h(Input, {
              label: "Email address",
              name: "email",
              type: "email",
              autoComplete: "email",
              required: true,
              value: formData.email,
              onChange: handleChange,
              fullWidth: true
            })
          ),

          h('div', null,
            h(Input, {
              label: "Password",
              name: "password",
              type: "password",
              autoComplete: "current-password",
              required: true,
              value: formData.password,
              onChange: handleChange,
              fullWidth: true
            })
          ),

          error && h('div', { className: "rounded-md bg-red-50 p-4" },
            h('div', { className: "flex" },
              h('div', { className: "ml-3" },
                h('h3', { className: "text-sm font-medium text-red-800" }, error)
              )
            )
          ),

          h('div', null,
            h(Button, {
              type: "submit",
              fullWidth: true,
              loading: isLoading,
              disabled: isLoading
            }, "Sign in")
          )
        ),

        h('div', { className: "mt-6" },
          h('div', { className: "relative" },
            h('div', { className: "absolute inset-0 flex items-center" },
              h('div', { className: "w-full border-t border-gray-300" })
            ),
            h('div', { className: "relative flex justify-center text-sm" },
              h('span', { className: "px-2 bg-white text-gray-500" }, "Or")
            )
          ),

          h('div', { className: "mt-6 space-y-3" },
            h(Button, {
              variant: "outline",
              fullWidth: true,
              onClick: () => handleDemoLogin('admin@pos.com', 'admin123'),
              disabled: isLoading
            }, "Demo Login (Admin)"),
            h(Button, {
              variant: "outline",
              fullWidth: true,
              onClick: () => handleDemoLogin('cashier@pos.com', 'cashier123'),
              disabled: isLoading
            }, "Demo Login (Cashier)")
          )
        ),

        h('div', { className: "mt-6 text-center" },
          h('div', { className: "text-sm text-gray-600 space-y-2" },
            h('p', { className: "font-medium" }, "Demo Credentials:"),
            h('div', { className: "space-y-1" },
              h('p', null, "Admin: admin@pos.com / admin123"),
              h('p', null, "Cashier: cashier@pos.com / cashier123")
            )
          )
        )
      )
    )
  );
};

export default LoginPage;
