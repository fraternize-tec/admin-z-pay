import {
  useGetList,
  useCreate,
  useUpdate,
  BooleanInput,
  NumberInput,
  TextInput,
  SaveButton,
  Toolbar,
  useNotify,
  useRecordContext,
} from 'react-admin';

import { Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export const EventoTaxaPrimeiraRecarga = () => {
  const record = useRecordContext(); // evento
  const notify = useNotify();

  const [data, setData] = useState<any>(null);

  const { data: lista, isLoading } = useGetList(
    'evento_taxa_primeira_recarga',
    {
      filter: { evento_id: record?.id },
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'criado_em', order: 'DESC' },
    },
    { enabled: !!record?.id }
  );

  const [create] = useCreate();
  const [update] = useUpdate();

  useEffect(() => {
    if (lista && lista.length > 0) {
      setData(lista[0]);
    } else if (record?.id) {
      // cria automaticamente se não existir
      create(
        'evento_taxa_primeira_recarga',
        {
          data: {
            evento_id: record.id,
            ativa: false,
            valor: 0,
            descricao: 'Taxa de ativação do cartão',
          },
        },
        {
          onSuccess: ({ data }) => setData(data),
        }
      );
    }
  }, [lista, record]);

  if (!record || isLoading || !data) return null;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Taxa da primeira recarga
        </Typography>

        <BooleanInput
          source="ativa"
          label="Cobrar taxa na primeira recarga"
          defaultValue={data.ativa}
          onChange={(e) =>
            setData({ ...data, ativa: e.target.checked })
          }
        />

        {data.ativa && (
          <>
            <NumberInput
              source="valor"
              label="Valor da taxa"
              defaultValue={data.valor}
              onChange={(e) =>
                setData({ ...data, valor: Number(e.target.value) })
              }
              min={0}
              step={0.01}
              fullWidth
            />

            <TextInput
              source="descricao"
              defaultValue={data.descricao}
              fullWidth
              onChange={(e) =>
                setData({ ...data, descricao: e.target.value })
              }
            />
          </>
        )}

        <Toolbar sx={{ mt: 2 }}>
          <SaveButton
            label="Salvar taxa"
            onClick={() =>
              update(
                'evento_taxa_primeira_recarga',
                {
                  id: data.id,
                  data,
                  previousData: data,
                },
                {
                  onSuccess: () =>
                    notify('Taxa atualizada com sucesso', {
                      type: 'success',
                    }),
                }
              )
            }
          />
        </Toolbar>
      </CardContent>
    </Card>
  );
};
