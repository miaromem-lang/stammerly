import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'kid' | 'parent' | 'teacher' | 'therapist' | 'admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  // Fetch user role from database using raw query to avoid type issues
  const fetchUserRole = useCallback(async (userId: string): Promise<AppRole | null> => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: userId })
        .single();
      
      // Fallback to direct query if RPC doesn't exist
      if (error) {
        const { data: roleData } = await supabase
          .from('user_roles' as any)
          .select('role')
          .eq('user_id', userId)
          .single();
        
        if (roleData && typeof roleData === 'object' && 'role' in roleData) {
          return roleData.role as AppRole;
        }
        return null;
      }
      return data as AppRole;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        // Defer role fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id).then(role => {
              setAuthState(prev => ({ ...prev, role }));
            });
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, role: null }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
      
      if (session?.user) {
        fetchUserRole(session.user.id).then(role => {
          setAuthState(prev => ({ ...prev, role }));
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const signUp = async (email: string, password: string, role: AppRole) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) return { error };

    // If signup successful and user exists, create role
    if (data.user) {
      const { error: roleError } = await supabase
        .from('user_roles' as any)
        .insert({ user_id: data.user.id, role } as any);
      
      if (roleError) {
        console.error('Failed to assign role:', roleError);
        return { error: new Error('Failed to assign role. Please try again.') };
      }
      
      setAuthState(prev => ({ ...prev, role }));
    }

    return { data, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    // Fetch role after successful login
    if (data.user) {
      const role = await fetchUserRole(data.user.id);
      setAuthState(prev => ({ ...prev, role }));
    }

    return { data, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setAuthState({
        user: null,
        session: null,
        role: null,
        loading: false,
      });
    }
    return { error };
  };

  return {
    user: authState.user,
    session: authState.session,
    role: authState.role,
    loading: authState.loading,
    isAuthenticated: !!authState.session,
    signUp,
    signIn,
    signOut,
  };
}
