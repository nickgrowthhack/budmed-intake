## Objetivo
- Impedir reenvio: `intake-response` deve aceitar somente a primeira submissão; chamadas subsequentes retornam erro claro sem sobrescrever dados.

## Alterações
- Manter `Deno.serve`, CORS e timeout com `AbortController`.
- Antes de gravar, verificar se já existe resposta para `intake_link_id`:
  1. `select('id, submitted_at').eq('intake_link_id', link.id).maybeSingle()`.
  2. Se existir: retornar `409` com JSON `{ error: 'Já enviado', appointment_id, token, submitted_at }`.
  3. Se não existir: `insert({ intake_link_id, answers }).select('submitted_at').single()`.
- Concorrência: se duas requisições simultâneas ocorrerem, tratar `insert` com erro de conflito (chave única) e retornar `409` também.

## Testes (Postman)
- Primeira chamada `POST intake-response/<TOKEN>` com `answers` → 200 `saved`.
- Segunda chamada com o mesmo token → 409 `Já enviado`.

## Resultado
- Submissão única por link, idempotência garantida e sem sobrescrita dos dados.