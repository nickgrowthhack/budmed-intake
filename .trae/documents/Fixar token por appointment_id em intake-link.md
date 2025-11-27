## Problema
- A cada chamada o `intake-link` gera um novo `token`, mudando o `patient_link`. Precisamos tornar o `token` estável por `appointment_id`.

## Solução
- Manter `Deno.serve` e o padrão que já funciona.
- Mudar a lógica de persistência:
  1. Tentar obter o link existente: `select('id, token').eq('appointment_id', appointmentId).maybeSingle()`.
  2. Se existir, usar `token` já salvo e responder.
  3. Se não existir, criar a linha com `insert({ appointment_id, token })` ou `upsert` com `ignoreDuplicates: true`:
     - `upsert({ appointment_id, token }, { onConflict: 'appointment_id', ignoreDuplicates: true })`
     - Em conflito, não atualiza; depois `select('token').eq('appointment_id', appointmentId).single()` para retornar o token persistente.
- Continuar usando `fetchWithTimeout` (AbortController) para garantir resposta em ≤7s.
- CORS/OPTIONS e logs permanecem iguais.

## Testes (Postman)
- `POST /functions/v1/intake-link/appointments/123` com `authorization` e `apikey`.
- Primeira chamada: cria e retorna o novo `token`.
- Chamadas subsequentes: retornam sempre o mesmo `token`.

## Resultado
- `token` e `patient_link` passam a ser determinísticos por `appointment_id`, eliminando variação a cada chamada.