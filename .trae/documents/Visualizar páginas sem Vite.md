## Opções de Visualização
- Abrir direto no navegador: `c:\BudMed\budmed-intake\web\patient\index.html` (renderiza UI; chamadas a `/intake/...` não funcionam sem backend).
- Servidor estático simples:
  - Node: `npx serve web/patient` ou `npx http-server web/patient -p 5500`
  - Python: `python -m http.server -d web/patient 5500`
  - PowerShell (IIS Express opcional) ou qualquer server que sirva `web/patient`.
- Deploy simples: publicar `web/patient` como estático (CDN ou bucket público) e apontar para funções HTTP do Supabase.

## Ajuste das Chamadas de API
- Preencher `web/patient/config.js` com `PUBLIC_FUNCTION_BASE_URL` do Supabase Functions (ex.: `https://<project-ref>.functions.supabase.co`).
- Ajustar `app.js` para usar `window.ENV.PUBLIC_FUNCTION_BASE_URL` ao construir as URLs:
  - Se definido: `fetch(`${PUBLIC_FUNCTION_BASE_URL}/intake/${token}/response`, ...)`
  - Senão: manter relativo `/intake/${token}/response`.

## Supabase (Backend)
- Subir as Edge Functions no Supabase para que o frontend funcione em qualquer servidor estático.
- Manter `SUPABASE_SERVICE_ROLE_KEY` apenas no backend; frontend usa `SUPABASE_ANON_KEY` se for chamar RPC.

## Passo a Passo Sugerido
1) Servir `web/patient/` com um servidor estático local para visualizar a página.
2) Preencher `web/patient/config.js` com `PUBLIC_FUNCTION_BASE_URL` e demais variáveis públicas.
3) Atualizar `app.js` para ler `window.ENV` e usar URL absoluta das funções.
4) Validar o fluxo de envio com um token real e as funções ativas no Supabase.

## Observações
- Sem Vite, não há HMR/TS; porém a página estática é suficiente para o MVP.
- O backend deve estar acessível via URL pública ou túnel para testes locais (ex.: `ngrok`), caso queira testar end‑to‑end.