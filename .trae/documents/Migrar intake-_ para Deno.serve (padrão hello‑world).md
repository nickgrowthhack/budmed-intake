## Objetivo
- Migrar `supabase/functions/intake-link/index.ts` para o padrão `Deno.serve` (como a hello‑world), manter a lógica de negócio e garantir resposta em tempo finito.

## Alterações
- Importar `jsr:@supabase/functions-js/edge-runtime.d.ts`, log de início e `Deno.serve((req) => ...)` como entrypoint.
- CORS/OPTIONS: responder `OPTIONS` com cabeçalhos CORS e permitir `GET, POST, OPTIONS`.
- Extração do `appointmentId` a partir do último segmento do path (compatível com `.../appointments/123`).
- Geração de `token` e `patient_link` preservadas.
- Client Supabase com timeout real: implementar `fetchWithTimeout` (AbortController) e passar em `createClient(..., { global: { fetch } })` para abortar chamadas ao PostgREST em ~7s.
- Upsert em duas etapas: `upsert` seguido de `select ... single()` por `appointment_id`, ambos com timeout.
- Respostas JSON consistentes: `200` em sucesso; `400` se `appointmentId` ausente; `504` com `{ error: 'timeout' }` em abort; `500` com `{ error }` em falha.
- Logs simples (start, upsert begin/done, select begin, end/status) para diagnóstico no Dashboard.

## Testes
- `POST https://<ref>.supabase.co/functions/v1/intake-link/appointments/123` com `authorization` e `apikey`: espera `200` com `{ appointment_id, token, patient_link }` em ≤7s.
- Sem banco ou indisponível: retorna `504` com JSON em ≤7s (sem pendurar).

## Resultado
- `intake-link` passa a responder no mesmo padrão do hello‑world, com controle de tempo e sem carregar indefinidamente.