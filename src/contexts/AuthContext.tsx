import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar perfil do usuário
  const loadProfile = async (userId: string) => {
    try {
      // Tentar carregar do cache primeiro
      const cached = localStorage.getItem('embrapa-user-profile');
      if (cached) {
        setProfile(JSON.parse(cached));
      }

      // Buscar do Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Se não existir perfil, criar um básico
        if (error.code === 'PGRST116') {
          const userEmail = (await supabase.auth.getUser()).data.user?.email;
          const newProfile = {
            name: userEmail?.split('@')[0] || 'Usuário',
            email: userEmail || '',
            phone: '',
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              ...newProfile,
            });

          if (!insertError) {
            setProfile(newProfile);
            localStorage.setItem('embrapa-user-profile', JSON.stringify(newProfile));
          }
        }
      } else if (data) {
        const profileData = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        };
        setProfile(profileData);
        localStorage.setItem('embrapa-user-profile', JSON.stringify(profileData));
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Carregar perfil se houver usuário
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Carregar perfil ao fazer login
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        localStorage.removeItem('embrapa-user-profile');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      localStorage.removeItem('embrapa-user-profile');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
