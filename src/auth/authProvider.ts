import type { AuthProvider } from 'react-admin';
import { supabase } from '../lib/supabaseClient';

type LoginParams = {
  email?: string;
  password?: string;
  provider?: 'google';
  magicLink?: boolean;
};

export const authProvider: AuthProvider = {
  /* ================= LOGIN ================= */
  login: async (params: LoginParams) => {
    const { email, password, provider, magicLink } = params;

    // 🔐 EMAIL + SENHA
    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return Promise.resolve();
    }

    // 🔗 MAGIC LINK
    if (magicLink && email) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // ⚠️ Não redireciona (usuário precisa clicar no email)
      return Promise.resolve();
    }

    // 🌐 GOOGLE LOGIN
    if (provider === 'google') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // ⚠️ Redirecionamento é externo (OAuth)
      return Promise.resolve();
    }

    throw new Error('Parâmetros de login inválidos');
  },

  /* ================= LOGOUT ================= */
  logout: async () => {
    await supabase.auth.signOut();
    return Promise.resolve();
  },

  /* ================= CHECK AUTH ================= */
  checkAuth: async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      return Promise.reject();
    }

    return Promise.resolve();
  },

  /* ================= CHECK ERROR ================= */
  checkError: async (error) => {
    const status = error?.status;

    if (status === 401 || status === 403) {
      await supabase.auth.signOut();
      return Promise.reject();
    }

    return Promise.resolve();
  },

  /* ================= IDENTITY ================= */
  getIdentity: async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return Promise.reject();
    }

    return {
      id: data.user.id,
      fullName: data.user.email ?? '',
    };
  },

  /* ================= PERMISSIONS ================= */
  getPermissions: async () => {
    const { data, error } = await supabase
      .from('vw_usuario_permissoes')
      .select('*');

    if (error) throw error;

    return data;
  },
};