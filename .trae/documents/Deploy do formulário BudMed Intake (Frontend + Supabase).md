## Objetivo
- Evitar expor variáveis no GitHub e ainda assim disponibilizá-las no frontend no deploy.

## Estratégia
- Usar variáveis de ambiente definidas na Vercel e um build mínimo que gera `web/patient/config.js` durante o deploy.

## Arquivos a adicionar
- `web/patient/config.template.js` com placeholders:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PUBLIC_FUNCTION_BASE_URL`, `PUBLIC_INTAKE_BASE_URL`.
- `web/patient/scripts/generate-config.js` (Node) que lê `process.env` e escreve `web/patient/config.js` a partir do template.
- `web/patient/package.json` com script `build:config` executando `node scripts/generate-config.js`.
- Garantir que `.gitignore` continue ignorando `web/patient/config.js`.

## Configuração na Vercel
- Importar este repositório e definir `Root Directory` = `web/patient`.
- `Install Command`: `npm ci` (ou `npm install`).
- `Build Command`: `npm run build:config`.
- `Output Directory`: vazio.
- Definir variáveis de ambiente na Vercel (Production):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PUBLIC_FUNCTION_BASE_URL`, `PUBLIC_INTAKE_BASE_URL`.

## Fluxo de build
1. Vercel instala dependências em `web/patient`.
2. Script gera `config.js` usando envs da Vercel.
3. Vercel publica o conteúdo de `web/patient` (agora com `config.js` gerado).

## Verificações
- Após o deploy, confirmar que `config.js` existe no site e contém os valores.
- Validar chamadas às Edge Functions e fluxo do formulário.

## Observações
- Mesmo gerando `config.js` no build, os valores públicos ficarão acessíveis no cliente (como em qualquer SPA), porém não estarão versionados no GitHub.
- Nunca incluir `SERVICE_ROLE_KEY` no frontend; manter apenas em ambiente do backend.