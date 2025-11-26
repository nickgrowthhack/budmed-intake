# BudMed Intake

BudMed Intake é um microprojeto independente responsável por gerenciar o formulário de pré-anamnese (em inglês: "intake") da plataforma BudMed. O objetivo é permitir que o paciente, antes da consulta médica, receba um link único, preencha informações clínicas relevantes e envie esses dados. Durante a consulta, o médico pode visualizar tudo o que foi respondido dentro do sistema principal da BudMed.

O BudMed Intake permite que toda a preparação clínica da consulta seja feita antes do atendimento, agilizando diagnósticos, melhorando a qualidade do atendimento médico e reduzindo retrabalho no momento da consulta.

De maneira prática, cada consulta pode gerar um link único como este:

```
https://intake.budmed.com.br/patient/?token=123
```

Esse link é específico para cada consulta realizada dentro da BudMed, e uma vez respondido, as respostas não podem ser alteradas e nem visualizadas por qualquer outro usuário que acesse o link que não seja o próprio médico.

---

## 🎯 Escopo do microprojeto

### O que este microprojeto faz

- Gera e gerencia **links únicos de pré-anamnese**, SEMPRE associados a uma consulta específica.
- Exibe um **formulário PÚBLICO e SEGURO**.
- Salva essas respostas no SUPABASE usando **Postgres + RLS**.
- Permite que esses dados sejam retornados a partir de um **ENDPOINT** com:
  - O ID da consulta.
  - O token de segurança.

### O que este microprojeto não faz

- Não lida com qualquer forma de autenticação (como login de paciente ou profissional).
- Não lida com qualquer lógica de marcação de consulta.
- Não envia qualquer tipo de notificação por si só (como WhatsApp, SMS ou email).
- Não substitui a aplicação principal (é apenas um microfrontend complementar).

---

## 🧱 Tabelas & Endpoints

### Tabelas

- intake_links ("Este link pertence a esta consulta.")
  - id
  - appointment_id
  - token
  - created_at

- intake_responses ("Aqui estão as respostas da pré-anamnese para esta consulta.")
  - id
  - appointment_id
  - token
  - answers
  - submitted_at
 
---

### Endpoints

- **POST /appointments/{appointmentId}/intake-link**

Exemplo de resposta:
```
{
  "appointment_id": "123",
  "token": "123", // UUID gerado
  "patient_link": "https://intake.budmed.com.br/patient/?token=123"
}
```

Se já existir um link de intake para esta consulta, o endpoint retorna o mesmo token e patient_link (não cria outro).

- **POST /intake/{token}/response**

Exemplo de requisição:
```
{
  "answers": {
    "queixa_principal": "Insônia há 3 semanas.",
    "historico_relevante": "Ansiedade há 1 ano, em uso de escitalopram.",
    "alergias": "Nenhuma, eu acho."
  }
}
```

Exemplo de resposta:
```
{
  "status": "received",
  "appointment_id": "123",
  "token": "123",
  "submitted_at": "2025-11-26T12:00:00Z"
}
```

- **GET /appointments/{appointmentId}/intake-response**

Exemplo de resposta:
```
{
  "appointment_id": "123",
  "answers": null, // JSON da pré-anamnese
  "submitted_at": null
}
```