## O que será ajustado
- Alinhar os nomes das variáveis de ambiente após sua mudança para `PROJECT_URL` e `ANON_KEY`.
- Manter compatibilidade com nomes antigos (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`) para não quebrar ambientes que ainda não foram atualizados.

## Onde impacta
- Funções (Edge Functions) que inicializam o cliente Supabase:
  - `functions/intake-get/index.ts` usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (c:\BudMed\budmed-intake\functions\intake-get\index.ts:11–13).
  - `functions/intake-response/index.ts` usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (c:\BudMed\budmed-intake\functions\intake-response\index.ts:12–14).
  - `functions/intake-link/index.ts` usa `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (c:\BudMed\budmed-intake\functions\intake-link\index.ts:14–16).
- Frontend `config.example.js` ainda referencia `SUPABASE_URL`/`SUPABASE_ANON_KEY` (c:\BudMed\budmed-intake\web\patient\config.example.js:2–3).
- Seu `config.js` já está com `PROJECT_URL` e `ANON_KEY` (c:\BudMed\budmed-intake\web\patient\config.js:2–3).

## Mudanças propostas (com compatibilidade)
- Nas três funções, trocar leitura de env para aceitar novo e antigo nome:
  - `const supabaseUrl = Deno.env.get('PROJECT_URL') || Deno.env.get('SUPABASE_URL') || ''`
  - `const serviceKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''`
- Atualizar `web/patient/config.example.js` para refletir os novos nomes:
  - Remover `SUPABASE_URL`/`SUPABASE_ANON_KEY` e adicionar `PROJECT_URL`/`ANON_KEY`.
- Não alterar `PUBLIC_FUNCTION_BASE_URL` e `PUBLIC_INTAKE_BASE_URL` (continuam válidas e já usadas no código: c:\BudMed\budmed-intake\functions\intake-link\index.ts:7).
- Observação: o frontend atual não inicializa `supabase-js` (usa `fetch` para `/intake/...`), então `ANON_KEY` só será utilizado quando houver init do cliente no browser. Mesmo assim, deixaremos os nomes padronizados.

## Verificação
- Definir envs no ambiente das funções:
  - Mínimo: `PROJECT_URL` e `SERVICE_ROLE_KEY` (ou manter `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`).
- Testes manuais:
  - `GET /intake/:appointmentId/get` deve retornar respostas ligadas ao agendamento.
  - `POST /intake/:token/response` deve salvar respostas.
  - `GET /intake/:appointmentId/link` deve criar/retornar `token` e montar `patient_link` usando `PUBLIC_INTAKE_BASE_URL`.
- Frontend: confirmar que `config.js` carrega com `window.ENV.PROJECT_URL`/`ANON_KEY` sem erros.

## Resultado esperado
- Back-end e front-end compatíveis com os novos nomes.
- Zero quebra em ambientes que ainda usam os nomes `SUPABASE_*` graças ao fallback.

Se aprovar, aplico as alterações nos três arquivos de função e no `config.example.js`, executo validações e lhe mostro o resultado.