## O que será criado
- `supabase/.env.example` com placeholders de `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- `web/patient/config.example.js` expondo `window.ENV` com `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PUBLIC_FUNCTION_BASE_URL` (opcional) e `PUBLIC_INTAKE_BASE_URL`.
- Atualização do `web/patient/index.html` para carregar `config.js` antes de `app.js`.
- Ajustes mínimos nos handlers para ler env via `Deno.env.get(...)` quando necessário (sem expor segredos).

## Como você preencherá
- Copiar `supabase/.env.example` → `supabase/.env` e inserir valores do seu projeto.
- Copiar `web/patient/config.example.js` → `web/patient/config.js` e inserir as chaves públicas e URLs.
- No Supabase Dashboard, definir as mesmas variáveis para ambiente de produção das Edge Functions.

## Segurança
- `SUPABASE_SERVICE_ROLE_KEY` apenas em `supabase/.env` e nas Edge Functions; nunca em `web/patient`.
- Frontend usa somente `SUPABASE_ANON_KEY`.

## Resultado
- Projeto preparado para você colar as credenciais e rodar localmente/produzir sem vazar segredos.

## Próximos passos (após esta etapa)
- Opcional: integrar frontend via `supabase-js` chamando RPC.
- Endurecer RLS e validar `answers` via schema.