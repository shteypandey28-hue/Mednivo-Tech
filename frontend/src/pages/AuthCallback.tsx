import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAuth(token).then(() => {
        const authStorage = localStorage.getItem('mednivo-auth');
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            const user = parsed?.state?.user;
            if (user?.isOnboarded && user?.role === 'RECEPTIONIST') {
              navigate('/app/reception');
            } else {
              navigate('/app');
            }
          } catch {
            navigate('/app');
          }
        } else {
          navigate('/app');
        }
      });
    } else {
      navigate('/login?error=GoogleAuthFailed');
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-slate-600 font-medium">Signing you in securely...</p>
      </div>
    </div>
  );
}
