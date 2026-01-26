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

    let query = supabase
      .from(resource)
      .select('*', { count: 'exact' });

    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        query = query.eq(key, value as any);
      });
    }

    query = query
      .order(field, { ascending: order === 'ASC' })
      .range(rangeFrom, rangeTo);

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

    // =============================
    // AÇÕES CUSTOMIZADAS (Edge)
    // =============================
    if (resource === 'lotes_cartoes_gerar') {
      const { data, error } = await supabase.functions.invoke(
        'gerar-cartoes-lote',
        {
          body: params.data,
        }
      );

      if (error) {
        throw error;
      }

      return {
        data: data ?? {},
      };
    }

    if (resource === 'bloquear-cartao') {
      const { data, error } = await supabase.functions.invoke('bloquear-cartao', {
        body: params.data,
      });

      if (error) {
        throw error;
      }

      return {
        data: data?.data ?? { id: params.data.cartao_id },
      };
    }

    if (resource === 'resetar-cartao') {
      const { data, error } = await supabase.functions.invoke('resetar-cartao', {
        body: params.data,
      });

      if (error) {
        throw error;
      }

      return {
        data: data?.data ?? { id: params.data.cartao_id },
      };
    }

    if (resource === 'marcar-lote-impresso') {
      const { data, error } = await supabase.functions.invoke(
        'marcar-lote-impresso',
        {
          body: params.data,
        }
      );

      if (error) throw error;

      return {
        data: { id: params.data.lote_id },
      };
    }

    if (resource === 'gerar-cartoes-proprios') {
      const { data, error } = await supabase.functions.invoke(
        'gerar-cartoes-proprios',
        {
          body: params.data,
        }
      );

      if (error) {
        throw error;
      }

      return {
        data: {
          id: crypto.randomUUID(), // RA exige um id
          ...params.data,
        },
      };
    }

    if (resource === 'vincular-cartoes-evento') {
      const { data, error } = await supabase.functions.invoke(
        'vincular-cartoes-evento',
        {
          body: params.data,
        }
      );

      if (error) throw error;

      return {
        data: {
          id: crypto.randomUUID(),
          ...data,
        },
      };
    }


    if (resource === 'desvincular-cartoes-evento') {
      const { error } = await supabase.functions.invoke(
        'desvincular-cartoes-evento',
        {
          body: params.data,
        }
      );

      if (error) throw error;

      return {
        data: { id: params.data.cartao_id },
      };
    }
    // =============================
    // CREATE PADRÃO (CRUD)
    // =============================
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

  getManyReference: async (resource, params) => {
    const {
      target,
      id,
      pagination,
      sort,
      filter,
    } = params;

    const { page = 1, perPage = 10 } = pagination ?? {};
    const { field = 'id', order = 'ASC' } = sort ?? {};

    const rangeFrom = (page - 1) * perPage;
    const rangeTo = rangeFrom + perPage - 1;

    let query = supabase
      .from(resource)
      .select('*', { count: 'exact' })
      .eq(target, id);

    // filtros adicionais (se houver)
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value as any);
      });
    }

    const { data, error, count } = await query
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
