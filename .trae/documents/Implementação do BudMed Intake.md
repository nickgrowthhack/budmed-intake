## Arquitetura
- Backend leve com Supabase (Postgres + Edge Functions) para expor os três endpoints.
- Microfrontend público para o formulário, hospedado com cache/CDN e CORS restrito.
- Integração com app principal via `appointment_id` e uso de tokens UUID.

## Banco de Dados
- Tabela `intake_links`: `id` (UUID, PK), `appointment_id` (UUID/text, UNIQUE), `token` (UUID, UNIQUE), `created_at` (timestamptz, DEFAULT now()).
- Tabela `intake_responses`: `id` (UUID, PK), `intake_link_id` (FK → `intake_links.id`, UNIQUE), `answers` (JSONB, NOT NULL), `submitted_at` (timestamptz).
- Índices: UNIQUE em `appointment_id` (um link por consulta) e em `token`; FK com ON DELETE CASCADE.

## Políticas RLS
- `intake_links`: leitura restrita a serviços/Edge Functions; escrita apenas via serviço.
- `intake_responses`: permitir INSERT anônimo somente quando `token` é válido e ainda não há resposta associada; bloquear UPDATE/DELETE; leitura apenas por serviço.
- Funções SQL para validar `token` e vincular automaticamente `intake_link_id` na inserção.

## API Endpoints
- `POST /appointments/{appointmentId}/intake-link`: idempotente; cria ou retorna link existente; payload inclui `appointment_id`, `token`, `patient_link`.
- `POST /intake/{token}/response`: idempotente; aceita `answers` (JSON); valida token e estado; retorna `status`, `appointment_id`, `token`, `submitted_at`.
- `GET /appointments/{appointmentId}/intake-response`: retorna `answers` e `submitted_at`; 404 se não existir; 410 se expirado/consumido.

## Frontend do Paciente
- Página única leve: carregamento do `token` via querystring; renderização de campos; validação client-side; submissão segura.
- UX: prevenção de envio duplicado, feedback claro, acessibilidade básica.
- Hardening: rate limit no endpoint, reCAPTCHA (opcional), desabilitar autocomplete para PII sensível.

## Integração com BudMed
- Geração do link de intake ao criar/confirmar uma consulta (webhook ou chamada direta).
- Exibição de respostas dentro do prontuário via `GET /appointments/{id}/intake-response`.

## Observabilidade e Segurança
- Logs estruturados e correlação por `appointment_id` e `token` (apenas hash do token nos logs).
- Rate limiting por IP/`token`; monitoramento de erro; alertas.
- Criptografia em repouso (Postgres) e em trânsito (HTTPS); retenção e eliminação de dados conforme LGPD.

## Validação e Testes
- Schema de `answers` com validação (JSON Schema/Edge Functions).
- Testes: unitários (validações), integração (RLS e endpoints), E2E básico do fluxo.
- Testes idempotência e concorrência para evitar dupla submissão.

## Entregáveis
- Migrações SQL (schema + RLS).
- Edge Functions para 3 endpoints.
- Microfrontend público funcional.
- Documentação operante no `README.md` com exemplos atualizados.