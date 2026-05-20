// ExportDialog.tsx

import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

// ============================
// Tipos
// ============================

export type ExportFormat = "pdf" | "csv" | "xlsx";

export type ExportSection =
  | "financeiro"
  | "cartoes"
  | "caixas"
  | "operadores"
  | "pdvs";

export type ExportOptions = {
  format: ExportFormat;
  sections: ExportSection[];
  filters: {
    pdvs: string[];
    caixas: string[];
    operadores: string[];
  };
};

type DashboardData = {
  itens_por_pdv: { nome_pdv: string }[];
  recargas_por_caixa: { nome_caixa: string }[];
  recargas_por_operador: { operador_nome: string }[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: DashboardData;
  onExport: (options: ExportOptions) => Promise<void>;
};

// ============================
// Configurações
// ============================

const SECTION_OPTIONS: {
  key: ExportSection;
  label: string;
}[] = [
  { key: "financeiro", label: "Resumo Financeiro" },
  { key: "cartoes", label: "Indicadores Operacionais" },
  { key: "caixas", label: "Recargas por Caixa" },
  { key: "operadores", label: "Recargas por Operador" },
  { key: "pdvs", label: "Vendas por PDV" },
];

const DEFAULT_SECTIONS: ExportSection[] = [
  "financeiro",
  "cartoes",
  "caixas",
  "operadores",
  "pdvs",
];

// ============================
// Helpers
// ============================

function toggleItem<T>(items: T[], item: T): T[] {
  return items.includes(item)
    ? items.filter((i) => i !== item)
    : [...items, item];
}

type CheckboxListProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
};

function CheckboxList({
  label,
  options,
  selected,
  onChange,
}: CheckboxListProps) {
  if (options.length === 0) return null;

  const allSelected = selected.length === options.length;

  return (
    <FormControl component="fieldset">
      <FormLabel>{label}</FormLabel>

      <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
        <Button
          size="small"
          onClick={() =>
            onChange(allSelected ? [] : options)
          }
        >
          {allSelected ? "Limpar" : "Selecionar todos"}
        </Button>
      </Stack>

      <FormGroup>
        {options.map((option) => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                checked={selected.includes(option)}
                onChange={() =>
                  onChange(
                    toggleItem(selected, option)
                  )
                }
              />
            }
            label={option}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}

// ============================
// Componente principal
// ============================

export default function ExportDialog({
  open,
  onClose,
  data,
  onExport,
}: Props) {
  const [format, setFormat] =
    useState<ExportFormat>("pdf");

  const [sections, setSections] =
    useState<ExportSection[]>(
      DEFAULT_SECTIONS
    );

  const [pdvs, setPdvs] = useState<string[]>([]);
  const [caixas, setCaixas] = useState<string[]>([]);
  const [operadores, setOperadores] = useState<
    string[]
  >([]);

  const [loading, setLoading] = useState(false);

  // ============================
  // Opções de filtros
  // ============================

  const pdvOptions = useMemo(
    () =>
      data.itens_por_pdv.map(
        (p) => p.nome_pdv
      ),
    [data]
  );

  const caixaOptions = useMemo(
    () =>
      data.recargas_por_caixa.map(
        (c) => c.nome_caixa
      ),
    [data]
  );

  const operadorOptions = useMemo(
    () =>
      data.recargas_por_operador.map(
        (o) => o.operador_nome
      ),
    [data]
  );

  // ============================
  // Ações
  // ============================

  const handleToggleSection = (
    section: ExportSection
  ) => {
    setSections((prev) =>
      toggleItem(prev, section)
    );
  };

  const handleSelectAllSections = () => {
    setSections((prev) =>
      prev.length === SECTION_OPTIONS.length
        ? []
        : DEFAULT_SECTIONS
    );
  };

  const handleExport = async () => {
    setLoading(true);

    try {
      await onExport({
        format,
        sections,
        filters: {
          pdvs,
          caixas,
          operadores,
        },
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

  const hasAtLeastOneSection =
    sections.length > 0;

  // ============================
  // Render
  // ============================

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Exportar Relatório
      </DialogTitle>

      <DialogContent>
        <Stack spacing={4} sx={{ mt: 1 }}>
          {/* Formato */}
          <TextField
            select
            label="Formato"
            value={format}
            onChange={(e) =>
              setFormat(
                e.target
                  .value as ExportFormat
              )
            }
            fullWidth
          >
            <MenuItem value="pdf">
              PDF
            </MenuItem>
            <MenuItem value="csv">
              CSV
            </MenuItem>
            <MenuItem value="xlsx">
              Excel (.xlsx)
            </MenuItem>
          </TextField>

          <Divider />

          {/* Seções */}
          <FormControl component="fieldset">
            <FormLabel>
              Seções do relatório
            </FormLabel>

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, mb: 1 }}
            >
              <Button
                size="small"
                onClick={
                  handleSelectAllSections
                }
              >
                {sections.length ===
                SECTION_OPTIONS.length
                  ? "Limpar"
                  : "Selecionar todas"}
              </Button>
            </Stack>

            <FormGroup>
              {SECTION_OPTIONS.map(
                (section) => (
                  <FormControlLabel
                    key={section.key}
                    control={
                      <Checkbox
                        checked={sections.includes(
                          section.key
                        )}
                        onChange={() =>
                          handleToggleSection(
                            section.key
                          )
                        }
                      />
                    }
                    label={section.label}
                  />
                )
              )}
            </FormGroup>
          </FormControl>

          <Divider />

          {/* Filtros */}
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Filtros (opcional)
          </Typography>

          <CheckboxList
            label="PDVs"
            options={pdvOptions}
            selected={pdvs}
            onChange={setPdvs}
          />

          <CheckboxList
            label="Caixas"
            options={caixaOptions}
            selected={caixas}
            onChange={setCaixas}
          />

          <CheckboxList
            label="Operadores"
            options={operadorOptions}
            selected={operadores}
            onChange={setOperadores}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleExport}
          disabled={
            loading ||
            !hasAtLeastOneSection
          }
        >
          {loading
            ? "Exportando..."
            : "Exportar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}