import {useCallback, useState} from 'react';
import {api} from '../api';

interface AuthUser {
  id: string;
  name: string;
  photo_url?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleAuth = useCallback(async (tgData: any) => {
    try {
      const data = await api.auth(tgData);
      if (data.token) {
        localStorage.setItem('token', data.token);
        const userData: AuthUser = {
          id: data.user_id,
          name: tgData.first_name,
          photo_url: tgData.photo_url || null
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
    } catch (e) {
      console.error("Auth error:", e);
    }
    return false;
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return {user, handleAuth, handleLogout, isAuthenticated: !!user};
}
