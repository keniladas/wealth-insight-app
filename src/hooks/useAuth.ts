
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('finance_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string, name?: string) => {
    // Simulate authentication
    const userData = {
      id: Date.now().toString(),
      name: name || email.split('@')[0],
      email,
    };
    
    setUser(userData);
    localStorage.setItem('finance_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finance_user');
  };

  return {
    user,
    login,
    logout,
  };
};
