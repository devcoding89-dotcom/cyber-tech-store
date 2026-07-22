import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { useAdminStore } from '@/store/adminStore';

export default function AdminApp() {
  const { isAuthenticated, logout } = useAdminStore();
  const navigate = useNavigate();
  const [key, setKey] = useState(0);

  const handleLogin = () => {
    setKey(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    setKey(prev => prev + 1);
    // Redirect to home page
    navigate('/');
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} key={key} />;
}
