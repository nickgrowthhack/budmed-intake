## Visão Rápida
- Frontend estático em `web/patient` (HTML/CSS/JS puro, sem build).
- Backend em 3 funções edge (`functions/intake-link`, `intake-response`, `intake-get`).
- O formulário envia para `/intake/:token/response` na mesma origem; sem proxy, use base de funções e CORS.

## Pré‑requisitos
- Projeto Supabase ativo e CLI instalada.
- Domínio onde o site ficará (ex.: `https://intake.budmed.com.br`).
- Acesso para configurar variáveis de ambiente nas funções.

## Passo 1 — Configurar variáveis do frontend
- Copie `web/patient/config.example.js` para `web/patient/config.js`.
- Preencha:
  - `SUPABASE_URL`: URL do seu projeto Supabase.
  - `SUPABASE_ANON_KEY`: chave pública (se vier a usar o client do Supabase).
  - `PUBLIC_FUNCTION_BASE_URL`: base das funções (ex.: `https://<PROJECT_REF>.functions.supabase.co`).
  - `PUBLIC_INTAKE_BASE_URL`: URL pública do site do paciente (ex.: `https://intake.budmed.com.br/patient/`).

## Passo 2 — Deploy das Edge Functions (Supabase)
- Autentique e vincule o projeto: `supabase login` e `supabase link --project-ref <PROJECT_REF>`.
- Configure variáveis nas funções:
  - `PUBLIC_INTAKE_BASE_URL` para montar links em `intake-link`.
  - Se necessário: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Faça deploy por função:
  - `supabase functions deploy intake-link`
  - `supabase functions deploy intake-response`
  - `supabase functions deploy intake-get`

## Passo 3 — Hospedar o frontend estático
- Opção A (recomendada): hospedar em Cloudflare Pages, Netlify ou Vercel.
  - Origem/dir público: a pasta `web/patient`.
  - Sem comando de build; diretório de saída é a própria pasta.
- Domínio: aponte `intake.budmed.com.br/patient` para o site publicado.

## Passo 4 — Integrar frontend ⇄ funções
- Opção 1 (sem mudanças no código): configurar proxy para manter mesma origem.
  - Crie regras de rewrite do host do site para as funções Supabase:
    - `/intake/:token/response` → `https://<PROJECT_REF>.functions.supabase.co/intake-response/:token` (200)
    - `/appointments/:appointmentId/intake-link` → `https://<PROJECT_REF>.functions.supabase.co/intake-link/:appointmentId` (200)
    - `/appointments/:appointmentId/intake-response` → `https://<PROJECT_REF>.functions.supabase.co/intake-get/:appointmentId` (200)
- Opção 2 (sem proxy): usar base de funções nas chamadas do app.
  - Atualizar `app.js` para usar `window.ENV.PUBLIC_FUNCTION_BASE_URL` ao fazer `fetch`:
    - `fetch(
      \\`${window.ENV.PUBLIC_FUNCTION_BASE_URL}/intake-response/${token}\\`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }
      )`

## Passo 5 — CORS (necessário se usar domínios diferentes)
- Adicione cabeçalhos nas funções:
  - `Access-Control-Allow-Origin: https://intake.budmed.com.br`
  - `Access-Control-Allow-Methods: GET, POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`
- Trate `OPTIONS` pré‑voo retornando 204 com os mesmos cabeçalhos.

## Passo 6 — Banco de dados (se aplicável)
- Aplique migração `supabase/migrations/0001_init.sql` no Postgres do Supabase.
- Evolua as funções para persistir e ler respostas conforme tabelas; hoje estão em modo stub.

## Passo 7 — Teste de ponta a ponta
- Gere link do paciente: `POST /appointments/{appointmentId}/intake-link`.
- Abra o link (`PUBLIC_INTAKE_BASE_URL?token=...`) e envie o formulário.
- Consulte respostas: `GET /appointments/{appointmentId}/intake-response`.
- Valide logs das funções e status/JSON retornado.

## Passo 8 — Checklist de produção
- HTTPS no domínio e HSTS.
- Rate limit nas funções e validação de token.
- Observabilidade: logs/alerts nas funções.
- Política de CORS restrita ao seu domínio.

## Entregáveis após confirmação
- Criação de `config.js` com valores de produção.
- (Se optar pela integração sem proxy) atualização de `app.js` para usar `PUBLIC_FUNCTION_BASE_URL`.
- Inclusão de regras de rewrite no host escolhido ou cabeçalhos CORS nas funções.
- Scripts de verificação com `curl` para teste dos endpoints.