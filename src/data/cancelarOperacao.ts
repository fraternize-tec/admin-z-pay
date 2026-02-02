import { supabase } from "../lib/supabaseClient";

export async function cancelarOperacao(params: {
  tipo: "recarga" | "consumo";
  id: string;
  motivo_id: string;
  observacao?: string;
}) {
  const { data, error } = await supabase.functions.invoke(
    "cancelar-operacao",
    {
      body: params
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.sucesso) {
    throw new Error(data?.mensagem || "Erro ao cancelar");
  }

  return data;
}
