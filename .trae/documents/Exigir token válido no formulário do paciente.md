## Objetivo
- Bloquear visualização e uso do formulário sem um token válido.
- Validar o token logo ao carregar a página, exibindo mensagem clara quando inválido ou já utilizado.

## Backend (Edge Function)
- Criar `supabase/functions/intake-validate/index.ts` usando `Deno.serve` (padrão hello‑world):
  - Método: `GET, OPTIONS`
  - Rota: `/intake-validate/<TOKEN>`
  - Retorno `200` com `{ valid: true, appointment_id, submitted: boolean }`:
    - `valid = true` se existe em `intake_links`.
    - `submitted = true` se há registro em `intake_responses` para o link.
  - Retorno `404` com `{ valid: false }` se token não existe.
  - CORS e `Connection: keep-alive`.
  - Timeout real via `AbortController` no client do `supabase-js`.

## Frontend (web/patient/app.js)
- Ao carregar:
  - Ler `token` da URL; se ausente, ocultar todas as etapas e mostrar mensagem “Link inválido ou ausente”.
  - Chamar `GET <PUBLIC_FUNCTION_BASE_URL>/intake-validate/<token>` com headers (`authorization`, `apikey`).
  - Se `404`, ocultar formulário e mostrar “Link inválido”.
  - Se `submitted: true`, ocultar formulário e mostrar “Você já enviou suas respostas”.
  - Se válido e não submetido, habilitar o formulário normalmente.
- Submissão continua igual, enviando `{ answers }` e tratando `409`.

## UI
- Adicionar área de aviso já existente (`#status`) para mensagens de bloqueio.
- Ocultar `.step` e desabilitar botão `Enviar` quando inválido ou já enviado.

## Testes
- Sem `token` → bloqueio imediato.
- Token inexistente → `404` do validate e bloqueio.
- Token já usado → `submitted: true` e bloqueio.
- Token válido e não usado → formulário operante.

## Resultado
- Usuários só veem e usam o formulário com token válido e ainda não utilizado; experiência clara e segura com validação no carregamento.