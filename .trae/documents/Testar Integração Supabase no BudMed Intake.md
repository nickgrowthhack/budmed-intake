## Visão Geral
- `web/patient/config.js` define `SUPABASE_URL` e `SUPABASE_ANON_KEY` e é carregado em `web/patient/index.html` (web/patient/index.html:11).
- `.env` para funções: modelo em `supabase/.env.example` com `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_INTAKE_BASE_URL` (supabase/.env.example:1-4).
- As Edge Functions atuais não inicializam o cliente Supabase; usam apenas `Deno.env.get('PUBLIC_INTAKE_BASE_URL')` (functions/intake-link/index.ts:5). Persistência ainda não está conectada (functions/intake-response/index.ts:1-6, functions/intake-get/index.ts:1-5).

## Objetivo do Teste
- Validar que variáveis estão corretas e que a integração Supabase funciona ponta a ponta (criar link, salvar resposta, ler resposta), mantendo segurança (SERVICE_ROLE só no backend).

## Passo 1 — Verificar Frontend
- Abrir `web/patient/index.html` em um servidor estático e confirmar que `window.ENV` contém `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PUBLIC_FUNCTION_BASE_URL`, `PUBLIC_INTAKE_BASE_URL` (web/patient/config.js:1-6, web/patient/config.example.js:1-5).
- Checar se as chamadas do frontend atingem as rotas (`/intake/{token}/response`) conforme `web/patient/app.js` (web/patient/app.js:22).

## Passo 2 — Preparar Variáveis nas Functions
- Garantir que `supabase/.env` (copiado de `supabase/.env.example`) está preenchido com:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PUBLIC_INTAKE_BASE_URL`
- Replicar as mesmas variáveis no Dashboard do Supabase para cada Edge Function (README.md:119-129).

## Passo 3 — Integrar Cliente Supabase nas Functions
- `functions/intake-link/index.ts`:
  - Criar token e escrever uma linha em `intake_links` com `appointment_id` e `token` usando `createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))`.
  - Retornar `patientLink` baseado em `PUBLIC_INTAKE_BASE_URL`.
- `functions/intake-response/index.ts`:
  - Receber `{ answers }` e `token` da rota, inserir em `intake_responses` vinculando ao `token`.
- `functions/intake-get/index.ts`:
  - Buscar por `appointment_id` ou `token` e retornar `answers` e `submitted_at` se existir.
- Observação: manter `SERVICE_ROLE_KEY` estritamente no backend; o frontend usa apenas `ANON_KEY`.

## Passo 4 — Testes Manuais E2E
- Criar link de paciente:
  - `POST /appointments/{appointmentId}/intake-link` → resposta com `patientLink` e `token`.
- Enviar respostas:
  - `POST /intake/{token}/response` com `{ answers: ... }` → status 200.
- Consultar respostas:
  - `GET /appointments/{appointmentId}/intake-response` → deve retornar `{ answers, submitted_at }`.
- Validar no Dashboard/SQL que `intake_links` e `intake_responses` receberam linhas (supabase/migrations/0001_init.sql:3-18).

## Passo 5 — Teste de Conexão Alternativo
- Se quiser testar sem alterar frontend: rodar um snippet (Node ou Edge) com `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` e fazer um `select` simples nas tabelas. Com `ANON_KEY`, somente ler/gravar se as políticas RLS permitirem; caso contrário, usar a função Edge.

## Segurança
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no frontend (README.md:129).
- Confirmar RLS habilitada (migrations) e políticas compatíveis com fluxo.

## Resultado Esperado
- Frontend lê `window.ENV` corretamente.
- Functions acessam Supabase com `SERVICE_ROLE_KEY` e conseguem inserir/consultar.
- Chamadas E2E retornam dados persistidos.

## Próximo Passo
- Após sua confirmação, implemento as mudanças nas três functions, adiciono o cliente Supabase e executo os testes descritos, reportando os resultados e referências de código.