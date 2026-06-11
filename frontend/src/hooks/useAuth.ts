import { useAuthStore } from '../store/authStore';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const { user, token, isAuthenticated, login: storeLogin, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string, expectedRole?: string) => {
    const data = await authService.login(email, password);
    if (expectedRole && data.user.role !== expectedRole) {
      throw new Error(`You are not registered as a ${expectedRole}.`);
    }
    storeLogin(data.user, data.token, data.cognitoTokens?.RefreshToken);
    toast.success(`Welcome back, ${data.user.name}!`);
    navigate(`/${data.user.role}/dashboard`);
    return data;
  };

  const register = async (formData: Parameters<typeof authService.register>[0]) => {
    const data = await authService.register(formData);
    toast.success('Account created! Please check your email to verify.');
    navigate('/verify', { state: { email: formData.email } });
    return data;
  };

  const verifyEmail = async (email: string, code: string) => {
    const data = await authService.verifyEmail(email, code);
    toast.success('Email verified successfully! Please log in.');
    navigate('/login');
    return data;
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    storeLogout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return { user, token, isAuthenticated, login, register, verifyEmail, logout };
};
