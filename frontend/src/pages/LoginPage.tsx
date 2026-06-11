import { useState } from 'react';
import { Link } from 'react-router-dom';import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../utils/validators';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';
import { Eye, EyeOff, Mail, Phone, Shield, User, Building2, X } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export default function LoginPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [role, setRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const roleColorClasses = {
    buyer: 'border-2 border-primary shadow-[0_0_40px_rgba(255,215,0,0.3)]',
    seller: 'border-2 border-secondary shadow-[0_0_40px_rgba(0,128,128,0.4)]',
    admin: 'border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]',
  };

  const inputClasses = {
    buyer: 'border-primary/30 focus:border-primary focus:ring-primary shadow-[0_0_10px_rgba(255,215,0,0.1)]',
    seller: 'border-secondary/30 focus:border-secondary focus:ring-secondary shadow-[0_0_10px_rgba(0,128,128,0.1)]',
    admin: 'border-red-500/30 focus:border-red-500 focus:ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
  };

  const handleRoleChange = (newRole: 'buyer' | 'seller' | 'admin') => {
    setRole(newRole);
    if (newRole === 'admin') {
      setValue('email', 'admin@gharbid.com');
    } else {
      setValue('email', '');
    }
  };

  const onSubmit = async (
  data: LoginFormData
) => {

  setLoading(true);

  try {

    await login(data.email, data.password, role);

  } catch (error: any) {

    import('sonner').then(
      ({ toast }) => {

        const msg =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          error.message ||
          'Login failed';

        toast.error(msg);

      }
    );

  } finally {

    setLoading(false);

  }
};


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-2">
          <Link to={ROUTES.HOME} className="p-2 rounded-full hover:bg-dark-hover text-muted hover:text-white transition-colors" title="Back to Home">
            <X size={24} />
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary from-10% to-primary to-40% drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]">Welcome Back</h1>
          <p className="text-muted mt-2">Sign in to your GharBid account</p>
        </div>

        <div className={`card p-8 space-y-6 transition-all duration-500 ${roleColorClasses[role]}`}>
          {/* Role Selection */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleRoleChange('buyer')}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                role === 'buyer' ? 'bg-primary/10 border-primary text-primary -translate-y-2 shadow-[0_0_20px_rgba(255,215,0,0.4)]' : 'bg-dark-hover border-dark-border text-muted hover:border-primary/50'
              }`}
            >
              <User size={20} />
              <span className="font-semibold text-xs">Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('seller')}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                role === 'seller' ? 'bg-secondary/10 border-secondary text-secondary -translate-y-2 shadow-[0_0_20px_rgba(0,128,128,0.4)]' : 'bg-dark-hover border-dark-border text-muted hover:border-secondary/50'
              }`}
            >
              <Building2 size={20} />
              <span className="font-semibold text-xs">Seller</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                role === 'admin' ? 'bg-red-500/10 border-red-500 text-red-500 -translate-y-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-dark-hover border-dark-border text-muted hover:border-red-500/50'
              }`}
            >
              <Shield size={20} />
              <span className="font-semibold text-xs">Admin</span>
            </button>
          </div>

          {/* Method Tabs */}
          {role !== 'admin' && (
            <div className="flex bg-dark-hover rounded-lg p-1 gap-1">
              <button
                id="login-tab-email"
                onClick={() => setMethod('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${method === 'email' ? 'bg-primary text-black' : 'text-muted hover:text-white'}`}
              >
                <Mail size={14} /> Email
              </button>
              <button
                id="login-tab-phone"
                onClick={() => setMethod('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${method === 'phone' ? 'bg-primary text-black' : 'text-muted hover:text-white'}`}
              >
                <Phone size={14} /> Phone OTP
              </button>
            </div>
          )}

          {method === 'email' || role === 'admin' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="text-xs text-muted mb-1 block">Email</label>
                <input id="login-email" type="email" readOnly={role === 'admin'} {...register('email')} className={`input-field transition-all duration-300 ${inputClasses[role]} ${role === 'admin' ? 'opacity-70 cursor-not-allowed' : ''}`} placeholder="you@example.com" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="login-password" className="text-xs text-muted mb-1 block">Password</label>
                <div className="relative">
                  <input id="login-password" type={showPassword ? 'text' : 'password'} {...register('password')} className={`input-field pr-10 transition-all duration-300 ${inputClasses[role]}`} placeholder="Your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white" aria-label="Toggle password">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <button id="login-submit" type="submit" disabled={loading} className="btn-primary btn-shine w-full flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:-translate-y-0.5 hover:brightness-110 active:scale-95 active:shadow-[0_0_10px_rgba(255,215,0,0.3)] transition-all duration-300">
                {loading ? <Loader size="sm" label="" /> : 'Sign In'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-muted text-sm text-center">Phone OTP login coming in Sprint 1</p>
            </div>
          )}

          <p className="text-center text-sm text-muted">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-primary hover:underline" id="login-to-register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
