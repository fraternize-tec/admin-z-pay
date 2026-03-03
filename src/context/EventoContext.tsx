import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { usePermissions } from "react-admin";
import { supabase } from "../lib/supabaseClient";
import {
  eventosPermitidos,
  isAdminGlobal,
} from "../utils/permissionUtils";

type Evento = {
  id: string;
  nome: string;
};

type EventoContextType = {
  eventoAtual: Evento | null;
  eventosDisponiveis: Evento[];
  setEventoAtual: (id: string) => void;
  loading: boolean;
  isAdmin: boolean;
};

const EventoContext = createContext<EventoContextType | undefined>(
  undefined
);

const STORAGE_KEY = "eventoSelecionado";

export const EventoProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { permissions, isLoading: permissionsLoading } =
    usePermissions();

  const [eventosDisponiveis, setEventosDisponiveis] =
    useState<Evento[]>([]);
  const [eventoAtual, setEventoAtualState] =
    useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = useMemo(() => {
    if (!permissions) return false;
    return isAdminGlobal(permissions);
  }, [permissions]);

  const setEventoAtual = useCallback(
    (id: string) => {
      const ev =
        eventosDisponiveis.find(e => e.id === id) ?? null;

      setEventoAtualState(ev);

      if (ev) {
        localStorage.setItem(STORAGE_KEY, ev.id);
      }
    },
    [eventosDisponiveis]
  );

  useEffect(() => {
    if (permissionsLoading) return;
    if (!permissions) {
      setLoading(false);
      return;
    }

    let active = true;

    const carregarEventos = async () => {
      setLoading(true);

      try {
        const permitidos = eventosPermitidos(permissions);

        let query = supabase
          .from("eventos")
          .select("id,nome")
          .order("nome");

        if (!isAdmin) {
          if (permitidos.length === 0) {
            if (active) {
              setEventosDisponiveis([]);
              setEventoAtualState(null);
              setLoading(false);
            }
            return;
          }

          query = query.in("id", permitidos);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Erro ao carregar eventos:", error);
          if (active) setLoading(false);
          return;
        }

        if (!active) return;

        const eventos = data ?? [];
        setEventosDisponiveis(eventos);

        const saved = localStorage.getItem(STORAGE_KEY);

        const inicial =
          eventos.find(e => e.id === saved) ??
          eventos[0] ??
          null;

        setEventoAtualState(inicial);
      } finally {
        if (active) setLoading(false);
      }
    };

    carregarEventos();

    return () => {
      active = false;
    };
  }, [permissions, permissionsLoading, isAdmin]);

  const value = useMemo(
    () => ({
      eventoAtual,
      eventosDisponiveis,
      setEventoAtual,
      loading,
      isAdmin,
    }),
    [
      eventoAtual,
      eventosDisponiveis,
      setEventoAtual,
      loading,
      isAdmin,
    ]
  );

  return (
    <EventoContext.Provider value={value}>
      {children}
    </EventoContext.Provider>
  );
};

export const useEvento = () => {
  const ctx = useContext(EventoContext);

  if (!ctx) {
    throw new Error(
      "useEvento deve ser usado dentro do EventoProvider"
    );
  }

  return ctx;
};