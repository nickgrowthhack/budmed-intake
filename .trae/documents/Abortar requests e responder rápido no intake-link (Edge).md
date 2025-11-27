## Causa Provável
- O 504 após ~150s indica timeout do gateway (Cloudflare/Supabase), não da nossa função. O `Promise.race` não aborta o request HTTP — ele só rejeita localmente. O fetch do `supabase-js` continua pendurado, e o runtime mantém a função viva até o gateway matar a execução.

## Ajuste Técnico
1. Abortar por tempo os requests do Supabase:
   - Implementar `fetchWithTimeout(url, init)` usando `AbortController` e `setTimeout` (6–7s).
   - Criar o client com `createClient(supabaseUrl, serviceKey, { global: { fetch: fetchWithTimeout } })` para que todo request seja abortado no tempo limite.
   - Manter a operação em duas etapas (upsert → select) para previsibilidade.
2. Responder sempre com JSON curto:
   - Em abort/erro, retornar `504` com `{ error: 'timeout' }` imediatamente (sem depender do gateway).
3. Manter POST/GET e logs existentes.

## Verificação (Postman)
- `POST /functions/v1/intake-link/appointments/123` com `authorization` e `apikey`.
- Esperado: resposta em ≤7s (200 com dados, ou 504 com JSON de timeout).
- Conferir logs no Dashboard para ver início, upsert, select e fim.

## Resultado
- A função deixa de “pendurar” por ~150s e passa a controlar o tempo de resposta, devolvendo JSON mesmo em indisponibilidade do PostgREST.