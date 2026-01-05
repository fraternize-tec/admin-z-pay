import type { AuthProvider } from 'react-admin';
import { supabase } from '../lib/supabaseClient';

type LoginParams = {
  email: string;
  password: string;
};

export const authProvider: AuthProvider = {
  /* ================= LOGIN ================= */
  login: async ({ email, password }: LoginParams) => {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return Promise.resolve();
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
    return [];
  },
};
