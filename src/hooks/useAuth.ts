
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('useAuth - current state:', { user, session, loading });

  useEffect(() => {
    console.log('useAuth - Setting up auth state listener');
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('useAuth - Auth state changed:', event, session);
        setSession(session);
        if (session?.user) {
          const authUser = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
          };
          console.log('useAuth - Setting user:', authUser);
          setUser(authUser);
        } else {
          console.log('useAuth - Clearing user');
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    console.log('useAuth - Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useAuth - Initial session check:', session);
      setSession(session);
      if (session?.user) {
        const authUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
        };
        console.log('useAuth - Setting initial user:', authUser);
        setUser(authUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, name?: string) => {
    try {
      console.log('useAuth - Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('useAuth - Login error:', error);
        throw error;
      }

      console.log('useAuth - Login successful:', data);
      return { success: true, error: null };
    } catch (error: any) {
      console.error('useAuth - Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('useAuth - Attempting registration with:', email, name);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('useAuth - Registration error:', error);
        throw error;
      }

      console.log('useAuth - Registration successful:', data);
      return { success: true, error: null };
    } catch (error: any) {
      console.error('useAuth - Registration failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('useAuth - Attempting logout');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('useAuth - Logout error:', error);
        throw error;
      }
      console.log('useAuth - Logout successful');
    } catch (error) {
      console.error('useAuth - Logout failed:', error);
    }
  };

  return {
    user,
    session,
    loading,
    login,
    register,
    logout,
  };
};
