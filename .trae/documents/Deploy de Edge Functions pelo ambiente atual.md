## Resumo
- Sim, é possível (e recomendado) fazer o deploy das Edge Functions a partir daqui usando o Supabase CLI.
- Vou preparar o passo a passo para Windows (PowerShell), sem executar nada até você confirmar.

## Pré‑requisitos
- Instalar o Supabase CLI:
  - `choco install supabase` (Windows com Chocolatey) ou siga a doc oficial: `https://supabase.com/docs/guides/cli`.
- Ter o `project-ref`: no seu caso é `urxchkxvcvdwmkjmokkq` (visto em `web/patient/config.js:2`).

## Configurar CLI
- No diretório `c:\BudMed\budmed-intake`:
  - `supabase login`
  - `supabase link --project-ref urxchkxvcvdwmkjmokkq`

## Segredos/Variáveis para as Functions
- Opção A: aplicar direto do arquivo `.env` das funções:
  - `supabase functions deploy intake-link --env-file supabase/.env`
  - `supabase functions deploy intake-response --env-file supabase/.env`
  - `supabase functions deploy intake-get --env-file supabase/.env`
- Opção B: definir via secrets (equivalente), útil para atualizar depois:
  - `supabase secrets set SUPABASE_URL="https://urxchkxvcvdwmkjmokkq.supabase.co"`
  - `supabase secrets set SUPABASE_ANON_KEY="<ANON_KEY>"`
  - `supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>"`
  - `supabase secrets set PUBLIC_INTAKE_BASE_URL="http://127.0.0.1:5500/web/patient/index.html"`

## Deploy
- Executar para cada função (usando a opção A acima é o caminho mais rápido):
  - `supabase functions deploy intake-link --env-file supabase/.env`
  - `supabase functions deploy intake-response --env-file supabase/.env`
  - `supabase functions deploy intake-get --env-file supabase/.env`
- O CLI retorna as URLs públicas no formato `https://urxchkxvcvdwmkjmokkq.supabase.co/functions/v1/<nome-da-funcao>`.

## Testes Pós‑Deploy (HTTP)
- Cabeçalhos obrigatórios (Edge Functions verificam JWT por padrão):
  - `authorization: Bearer <ANON_KEY>`
  - `apikey: <ANON_KEY>`

- Criar link de paciente (exemplo):
  - `POST https://urxchkxvcvdwmkjmokkq.supabase.co/functions/v1/intake-link/appointments/123`
  - Esperado: `{ appointment_id, token, patient_link }`

- Enviar respostas (exemplo):
  - `POST https://urxchkxvcvdwmkjmokkq.supabase.co/functions/v1/intake-response/intake/<TOKEN>/response`
  - Body: `{ "answers": { ... } }`
  - Esperado: `{ status: "saved", appointment_id, token, submitted_at }`

- Consultar respostas:
  - `GET https://urxchkxvcvdwmkjmokkq.supabase.co/functions/v1/intake-get/appointments/123/intake-response`
  - Esperado: `{ appointment_id, answers, submitted_at }` ou `answers: null` se não houver.

## Local (opcional)
- Para testar localmente uma função:
  - `supabase functions serve intake-link --env-file supabase/.env --no-verify-jwt`
  - Use o endpoint local que o CLI mostrar e chame com os mesmos caminhos.

## Frontend
- `web/patient/config.js` já aponta `PUBLIC_FUNCTION_BASE_URL` para `https://urxchkxvcvdwmkjmokkq.supabase.co/functions/v1`.
- Ao consumir, as rotas da página devem incluir o nome da função no caminho (ex.: `.../intake-response/intake/<token>/response`). Se preferir, depois ajusto as chamadas do `app.js` para usar `window.ENV.PUBLIC_FUNCTION_BASE_URL` + caminho correto.

## Segurança
- `SERVICE_ROLE_KEY` só nas funções (backend). O frontend usa apenas `ANON_KEY`.
- RLS está habilitada no Postgres; manteremos assim.

## Próximo Passo
- Com sua confirmação, executo os comandos de deploy acima, valido as três funções e te entrego as URLs e respostas de teste.