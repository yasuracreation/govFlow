import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx'; // Updated import path
import Input from '../components/common/Input.tsx';
import Button from '../components/common/Button.tsx';
import Alert from '../components/common/Alert.tsx';
import { APP_NAME } from '../constants.ts';
import { ShieldCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!employeeId) {
      setError("Employee ID is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    try {
      await login(employeeId, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <div className="flex justify-center mb-4">
            <ShieldCheck size={48} className="text-primary" />
          </div>
          <h2 className="text-center text-4xl font-extrabold text-primary-dark">
            {APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your Divisional Sector Office account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
          <Input
            label="Employee ID"
            name="employeeId"
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g., FD001"
            required
            autoFocus
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          <div>
            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Hint: Use Employee IDs like FD001, OF001, SH001, DH001, ADM001. Password for all mock users is "password123".</p>
          <p className="mt-1">NIC is used for citizen service requests, not for officer login.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;