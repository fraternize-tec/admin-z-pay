import type { DataProvider, RaRecord } from 'react-admin';
import { supabase } from '../lib/supabaseClient';

export const supabaseDataProvider: DataProvider = {
  /* ================= GET LIST ================= */
  getList: async (resource, params) => {
    const {
      page = 1,
      perPage = 10,
    } = params.pagination ?? {};

    const {
      field = 'id',
      order = 'ASC',
    } = params.sort ?? {};

    const rangeFrom = (page - 1) * perPage;
    const rangeTo = rangeFrom + perPage - 1;

    const { data, error, count } = await supabase
      .from(resource)
      .select('*', { count: 'exact' })
      .order(field, { ascending: order === 'ASC' })
      .range(rangeFrom, rangeTo);

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
  update: async <RecordType extends RaRecord = any>(
    resource: string,
    params: any
  ): Promise<{ data: RecordType }> => {
    const { id, data } = params;

    const { error } = await supabase
      .from(resource)
      .update(data)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return {
      data: {
        id,
        ...data,
      } as RecordType, 
    };
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
  deleteMany: async (resource, params) => {
    const { ids } = params;

    const { error } = await supabase
      .from(resource)
      .delete()
      .in('id', ids);

    if (error) {
      throw error;
    }

    return { data: ids };
  },

};
