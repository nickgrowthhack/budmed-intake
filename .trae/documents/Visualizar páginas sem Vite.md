## Próximos Passos
- Definir variáveis no Supabase Dashboard (Project Settings → Config Vars), incluindo `PUBLIC_INTAKE_BASE_URL`.
- Aplicar migrações com Supabase CLI.
- Estruturar Edge Functions no padrão `supabase/functions/` e publicar.

## .gitignore
- Adicionar entradas para: `supabase/.env`, `web/patient/config.js`, arquivos temporários (`Thumbs.db`, `.DS_Store`).
- Incluir `node_modules` e `dist/` caso no futuro use Vite.

## Supabase CLI
- Instalar CLI e autenticar.
- Executar: `supabase db push` para aplicar migrações.
- Criar/padronizar funções em `supabase/functions/{intake-link,intake-response,intake-get}/index.ts`.
- Deploy: `supabase functions deploy intake-link`, `intake-response`, `intake-get`.

## Frontend
- Servir `web/patient` com um servidor estático local.
- Validar montagem do `patient_link` e submissão do formulário.

## Documentação
- Atualizar README com comandos CLI e notas de ambiente.

## Segurança
- Garantir que `SUPABASE_SERVICE_ROLE_KEY` nunca vá para o frontend.
- Validar CORS, rate limiting e logs sem vazar tokens.