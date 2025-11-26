# BudMed Intake

BudMed Intake é um microprojeto independente responsável por gerenciar o formulário de pré-anamnese (em inglês: "intake") da plataforma BudMed. O objetivo é permitir que o paciente, antes da consulta médica, receba um link único, preencha informações clínicas relevantes e envie esses dados. Durante a consulta, o médico pode visualizar tudo o que foi respondido dentro do sistema principal da BudMed.

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