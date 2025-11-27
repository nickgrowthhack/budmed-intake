## Diagnóstico
- O comportamento de “carregar infinitamente” indica que o cliente não está recebendo uma resposta utilizável da função Edge.
- A função alvo está em `supabase/functions/intake-link/index.ts` (pontos principais em supabase/functions/intake-link/index.ts:3–35). Outras funções relacionadas seguem padrão similar: `intake-get` (supabase/functions/intake-get/index.ts:3–41) e `intake-response` (supabase/functions/intake-response/index.ts:3–43).
- Possíveis causas:
  - Falta de cabeçalhos CORS e tratamento de `OPTIONS` (preflight), comuns em chamadas de browsers para funções Edge.
  - Chamadas ao PostgREST sem timeout explícito; em condições de rede adversas podem aparentar “pendurar”.
  - `appointment_id` ausente ou inválido (path sem ID), levando a operações inesperadas.

## Causa Provável
- As três funções não definem cabeçalhos CORS nem retornos rápidos para `OPTIONS`. Em cenários com `content-type: application/json` e/ou cabeçalhos customizados, o navegador realiza preflight; sem resposta CORS adequada, o fetch do cliente não conclui de forma utilizável e aparenta pendurar.

## Mudanças Propostas na Edge Function
- Em `supabase/functions/intake-link/index.ts`:
  1. Adicionar `corsHeaders` com `Access-Control-Allow-Origin: *` e `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`.
  2. Tratar `req.method === 'OPTIONS'` com retorno imediato `200` e `corsHeaders`.
  3. Validar `appointmentId`: se vazio, retornar `400` com JSON de erro e `corsHeaders`.
  4. Envolver a operação Supabase em `try/catch` e usar um wrapper de timeout (`Promise.race`) para evitar penduradas prolongadas; em timeout, retornar `504` com mensagem clara.
  5. Incluir `corsHeaders` no `return` principal junto ao `content-type: application/json`.
- Replicar os itens 1, 2 e 5 também em `intake-get` e `intake-response` para padronização e evitar problemas semelhantes.

## Testes e Verificação
- Exercitar manualmente os endpoints:
  - `GET /functions/v1/intake-link/{appointmentId}` deve retornar `200` com `{ appointment_id, token, patient_link }`.
  - `OPTIONS /functions/v1/intake-link/{appointmentId}` deve retornar `200` com cabeçalhos CORS.
  - `GET` sem `{appointmentId}` deve retornar `400` com erro.
- Simular falhas de rede ou indisponibilidade do PostgREST para confirmar retorno `504` dentro do timeout.
- Conferir que `intake-get` e `intake-response` também respondem corretamente ao preflight e retornam JSON com CORS.

## Observações
- Variáveis exigidas: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (funções Edge) e `PUBLIC_INTAKE_BASE_URL` (para montar o link do paciente). A ausência já é tratada, mas os cabeçalhos CORS garantirão que o cliente receba o erro de forma consistente.
- O schema atual suporta `onConflict: 'appointment_id'` (ver supabase/migrations/0001_init.sql:3–8), então a lógica de `upsert` é válida.

## Resultado Esperado
- O endpoint `intake-link` deixa de “carregar infinitamente” e passa a responder estável, inclusive em cenários com preflight CORS e problemas de rede, retornando códigos de status apropriados com JSON.