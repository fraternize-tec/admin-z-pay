import type { DataProvider } from 'react-admin';
import { supabase } from '../lib/supabaseClient';

export const supabaseDataProvider: DataProvider = {
  /* ================= GET LIST ================= */
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from(resource)
      .select('*', { count: 'exact' })
      .range(from, to)
      .order(field, { ascending: order === 'ASC' });

    // filtros simples
    Object.entries(params.filter).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        query = query.ilike(key, `%${value}%`);
      }
    });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data ?? [],
      total: count ?? 0,
    };
  },

  /* ================= GET ONE ================= */
  getOne: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    return { data };
  },

  /* ================= CREATE ================= */
  create: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .insert(params.data)
      .select();

    if (error) {
      throw error;
    }

    return { data: data[0] };
  },


  /* ================= UPDATE ================= */
  update: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .update(params.data)
      .eq('id', params.id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Registro não encontrado');
    }

    return { data: data[0] };
  },


  /* ================= DELETE ================= */
  delete: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .delete()
      .eq('id', params.id)
      .select();

    if (error) {
      throw error;
    }

    return { data: data[0] };
  },


  /* ================= NÃO USADOS (por enquanto) ================= */
  getMany: async (resource, params) => {
    const { data, error } = await supabase
      .from(resource)
      .select('*')
      .in('id', params.ids);

    if (error) {
      throw error;
    }

    return { data: data ?? [] };
  },

  getManyReference: async () => Promise.reject(),
  updateMany: async () => Promise.reject(),
  deleteMany: async () => Promise.reject(),
};
