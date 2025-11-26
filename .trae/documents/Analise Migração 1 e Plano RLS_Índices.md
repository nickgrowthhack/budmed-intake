# Modelo de Dados de Intake — Migração 1

## Objetivo
- Documentar o schema criado na migração 1, a decisão de usar `intake_link_id` em `intake_responses` e como isso se integra aos fluxos e segurança.

## Resumo do Schema
- Extensão: `pgcrypto` para `gen_random_uuid()` (`supabase/migrations/0001_init.sql:1`).
- Tabelas:
  - `intake_links` (`supabase/migrations/0001_init.sql:3-8`)
    - `id uuid` PK, `default gen_random_uuid()`
    - `appointment_id text` `not null unique`
    - `token uuid` `not null unique` `default gen_random_uuid()`
    - `created_at timestamptz` `not null` `default now()`
  - `intake_responses` (`supabase/migrations/0001_init.sql:10-15`)
    - `id uuid` PK, `default gen_random_uuid()`
    - `intake_link_id uuid` `not null unique` FK → `intake_links(id)` `on delete cascade`
    - `answers jsonb` `not null`
    - `submitted_at timestamptz` `not null` `default now()`
- RLS habilitada nas duas tabelas (`supabase/migrations/0001_init.sql:17-18`).
- Índices extras criados (`supabase/migrations/0001_init.sql:20-21`).

## Fluxo de Negócio
- Criar/recuperar link por `appointment_id`:
  - Upsert em `intake_links` com conflito em `appointment_id`; retorna/garante um `token` por consulta (`functions/intake-link/index.ts:21-31`).
- Consultar respostas por consulta:
  - Busca link por `appointment_id` e, se existir, respostas por `intake_link_id` (`functions/intake-get/index.ts:18-33`).
- Submeter respostas via `token`:
  - Resolve `link.id` a partir do `token` e faz upsert em `intake_responses` por `intake_link_id` (`functions/intake-response/index.ts:28-37`).

## Por que `intake_link_id` em vez de `appointment_id`
- Normalização e integridade:
  - `intake_responses.intake_link_id` referencia a PK `uuid` de `intake_links` com FK e `on delete cascade` (`supabase/migrations/0001_init.sql:12`), garantindo integridade referencial.
- Segurança orientada a token:
  - O paciente opera com `token`. Vincular a resposta ao `link.id` evita gravação indevida apenas conhecendo um `appointment_id` textual.
- Unicidade 1:1 simples:
  - `intake_links(appointment_id)` único e `intake_responses(intake_link_id)` único reforçam “uma resposta por consulta” sem regras adicionais.
- Performance e índices:
  - `uuid` como FK facilita índices e joins rápidos em comparação a `text`.
- Cascata correta:
  - Apagar um link remove automaticamente sua resposta (`on delete cascade`), mantendo o dado coeso.

## Trade-offs se fosse `appointment_id` em `intake_responses`
- Seria possível, porém mais frágil:
  - Precisaria `unique` em `appointment_id` na tabela de respostas.
  - Perderia FK para entidade canônica; joins por `text` e maior risco de inconsistência.
  - A validação por `token` ficaria paralela, não embutida no relacionamento.

## Integração com Funções (Service Role)
- As Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY` e não sofrem bloqueio de RLS.
  - Criação/recuperação do token: `functions/intake-link/index.ts:21-31`.
  - Consulta por consulta: `functions/intake-get/index.ts:18-33`.
  - Submissão por token: `functions/intake-response/index.ts:28-37`.

## RLS e Política de Acesso
- Estado atual: RLS habilitada, sem políticas explícitas; acesso direto por clientes não é permitido por padrão.
- Estratégias:
  - Manter acesso apenas via Service Role (Edge Functions): simples e seguro.
  - Se for necessário acesso direto do cliente:
    - Permitir `select/insert/update` em `intake_responses` quando o JWT do cliente contiver claim do `token` do link, verificando correspondência ao `intake_link_id`.
    - Negar `select/insert/update/delete` em `intake_links` para `anon/authenticated` (exposição mínima).

## Índices
- Observação: as restrições `UNIQUE` já criam índices.
  - Índices extras (`supabase/migrations/0001_init.sql:20-21`) são redundantes e podem ser removidos para evitar custo e confusão.

## Exemplos de Consultas
- Respostas por `appointment_id`:
  - `select r.answers, r.submitted_at from intake_responses r join intake_links l on r.intake_link_id = l.id where l.appointment_id = 'APPT-123';`
- Resolver `token` e buscar resposta:
  - `select r.answers from intake_responses r join intake_links l on r.intake_link_id = l.id where l.token = 'uuid-token';`

## DDL Relevante
- Extensão: `create extension if not exists pgcrypto;` (`supabase/migrations/0001_init.sql:1`).
- Tabela `intake_links`: (`supabase/migrations/0001_init.sql:3-8`).
- Tabela `intake_responses`: (`supabase/migrations/0001_init.sql:10-15`).
- RLS: (`supabase/migrations/0001_init.sql:17-18`).
- Índices: (`supabase/migrations/0001_init.sql:20-21`).

## Recomendações
- Remover índices redundantes, mantendo apenas os `UNIQUE`.
- Definir políticas RLS apenas se houver acesso direto do cliente; caso contrário, manter via Edge Functions.
- Ajustar documentação (`README.md`) para refletir o vínculo por `intake_link_id`.
- Considerar validação de `answers` (JSON Schema) e auditoria leve (timestamps/IP/UA se aplicável).

## Próximo Passo
- Se aprovado, posso:
  - Preparar migração para remover índices redundantes.
  - Sugerir políticas RLS concretas conforme o modelo de acesso escolhido.
  - Atualizar o `README.md` com o relacionamento correto.
