# BudMed Intake

BudMed Intake é um microprojeto independente responsável por gerenciar o formulário de pré-anamnese (em inglês: "intake") da plataforma BudMed. O objetivo é permitir que o paciente, antes da consulta médica, receba um link único, preencha informações clínicas relevantes e envie esses dados. Durante a consulta, o médico pode visualizar tudo o que foi respondido dentro do sistema principal da BudMed.

O BudMed Intake permite que toda a preparação clínica da consulta seja feita antes do atendimento, agilizando diagnósticos, melhorando a qualidade do atendimento médico e reduzindo retrabalho no momento da consulta.


## Por que um microprojeto independente em vez de acoplado a aplicação?

Optamos por implementar o BudMed Intake como um microprojeto independente (front-end + Supabase) em vez de acoplar essa funcionalidade diretamente ao back-end principal por alguns motivos:

1. Velocidade de entrega (MVP rápido)
- A pré-anamnese é uma feature periférica, não nuclear ao fluxo de consultas.
- Usando Supabase (tabelas + RLS) e um mini frontend dedicado, é possível entregar uma versão funcional sem abrir sprint de backend, sem criar novas APIs REST/GraphQL, sem mexer na arquitetura existente.
- Isso reduz o tempo entre ideia → teste em produção.

2. Autonomia de desenvolvimento
- O problema é majoritariamente de UI + gravação simples de dados.
- Como o próprio frontend pode falar direto com o Supabase usando a anon key (com RLS bem configurado), não faz sentido bloquear essa entrega esperando o backend ter disponibilidade.
- O backend continua focado nas partes críticas: consultas, prescrição, pagamentos, etc.

3. Separação clara de responsabilidades
- O microprojeto cuida de uma coisa só: pré-anamnese (gerar link + receber respostas).
- O backend principal continua sendo o “cérebro” da operação clínica (agenda, pacientes, prescrições, integrações).
- Essa separação é alinhada com boas práticas de arquitetura: cada serviço/módulo tem um bounded context bem definido.

4. Menos impacto e risco no sistema principal
- Se algo quebrar no intake, o app principal da BudMed continua funcionando normalmente.
- Deploys são independentes: não é preciso redeployar o sistema inteiro para ajustar textos/campos do formulário.
- Isso reduz risco em produção e facilita experimentação (A/B de perguntas, por exemplo).

5. Escalabilidade de produto
- No futuro, podemos:
  - ter múltiplos tipos de intake,
  - traduzir o formulário,
  - criar fluxos customizados por especialidade,
  - evoluir o esquema de perguntas.
- Ter esse contexto isolado em um microprojeto ajuda a escalar sem criar um monolito difícil de manter.

6. Uso correto do Supabase como BaaS
- O Supabase já oferece:
  - banco Postgres,
  - API pronta,
  - Row Level Security,
  - SDK de frontend.
- Estamos usando-o exatamente como um Backend-as-a-Service, o que é uma prática comum para funcionalidades de borda como formulários, landing pages, intakes etc.
- A segurança não fica no “segredo do backend”, mas nas políticas de RLS, que é o padrão recomendado pelo próprio Supabase.

7. Integração simples com o backend depois
- Mesmo sendo independente, o intake foi modelado para se integrar facilmente:
  - tudo é vinculado a appointment_id e patient_id, que pertencem ao domínio principal.
- O back-end pode, quando fizer sentido, consumir esses dados:
  - diretamente do Postgres,
  - via Supabase client com service role,
  - ou expondo endpoints internos, se necessário.
- Ou seja: não é um “projeto paralelo”, é um módulo plugável.

---

## 🎯 Escopo do microprojeto

### O que este microprojeto faz

- Gera e gerencia _links únicos de pré-anamnese_, SEMPRE associados a uma consulta específica.
- Exibe um _formulário PÚBLICO e SEGURO_.
- Salva essas respostas no SUPABASE usando _Postgres + RLS_.
- Permite que esses dados sejam retornados a partir de um _ENDPOINT_ com:
  - O ID da consulta.
  - O token de segurança.

### O que este microprojeto não faz

- Não lida com qualquer forma de autenticação (como login de paciente ou profissional).
- Não lida com qualquer lógica de marcação de consulta.
- Não envia qualquer tipo de notificação por si só (como WhatsApp, SMS ou email).
- Não substitui a aplicação principal (é apenas um microfrontend complementar).

---

## 🧱 Arquitetura

- Front end: Next.js
- Back end: Supabase (PostgreSQL + Row Level Security)

##