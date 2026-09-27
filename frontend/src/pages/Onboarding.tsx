import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { User, Stethoscope, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function Onboarding() {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<'DOCTOR' | 'RECEPTIONIST'>('DOCTOR');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      // Update profile with new name, role, and mark as onboarded
      await authAPI.updateProfile({
        name,
        role,
        isOnboarded: true
      });
      
      // Refresh user profile in store
      const token = useAuthStore.getState().accessToken;
      if (token) {
        await setAuth(token);
      }

      // Navigate to respective dashboard
      if (role === 'RECEPTIONIST') {
        navigate('/app/reception');
      } else {
        navigate('/app');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Welcome to Mednivo
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Let's set up your profile to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 h-11 transition-shadow"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select your role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === 'DOCTOR'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Stethoscope className={`w-8 h-8 mb-2 ${role === 'DOCTOR' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="font-medium text-sm">Doctor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('RECEPTIONIST')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === 'RECEPTIONIST'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Briefcase className={`w-8 h-8 mb-2 ${role === 'RECEPTIONIST' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="font-medium text-sm">Receptionist</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
