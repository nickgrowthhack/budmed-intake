## Objetivo
- Eliminar o carregamento infinito em `intake-get` e `intake-response`, alinhando ao padrão que funcionou em `intake-link` e em `hello-world`.

## Alterações
- Converter ambas as funções para `Deno.serve` e importar `jsr:@supabase/functions-js/edge-runtime.d.ts`.
- Tratar `OPTIONS` com CORS, permitindo métodos adequados:
  - `intake-get`: `GET, OPTIONS`
  - `intake-response`: `POST, OPTIONS`
- Incluir `Connection: keep-alive` no retorno.
- Implementar `fetchWithTimeout` (AbortController ~7s) e usá-lo via `createClient(..., { global: { fetch } })` para abortar requests ao PostgREST.
- Manter a lógica atual de negócio, mas com respostas sempre em tempo finito:
  - `intake-get`: buscar link por `appointment_id` (último segmento do path); se existir, buscar `answers/submitted_at`; senão, retornar `answers: null`.
  - `intake-response`: extrair `token` (último segmento do path), validar body, buscar link por token; se existir, `upsert` de `intake_responses` por `intake_link_id` e retornar `submitted_at`.
- Adicionar logs simples de início/fim e etapas principais.

## Testes (Postman)
- `GET /functions/v1/intake-get/appointments/123` (Authorization/apikey) → `{ answers, submitted_at }` ou `null`.
- `POST /functions/v1/intake-response/<TOKEN>` (Authorization/apikey) com `{"answers":{...}}` → `{ status: 'saved', appointment_id, submitted_at }`.
- Respostas em ≤7s; em indisponibilidade do backend, `504` com JSON de erro.

## Resultado
- Funções estáveis, sem pendências, no mesmo padrão de `intake-link` e `hello-world`.