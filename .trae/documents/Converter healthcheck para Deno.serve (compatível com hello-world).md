## Objetivo
- Alinhar a função healthcheck ao padrão que funciona no seu projeto (hello-world) usando `Deno.serve`, para eliminar o comportamento de carregamento infinito.

## Alterações
- Reescrever `supabase/functions/healthcheck/index.ts` para:
  - Importar `jsr:@supabase/functions-js/edge-runtime.d.ts`.
  - Iniciar com `console.info('server started')`.
  - Usar `Deno.serve((req) => ...)`.
  - Tratar `OPTIONS` com CORS e responder imediatamente.
  - Responder `GET/POST` com JSON `{ ok: true, now, method, path }` e cabeçalhos `content-type` e `Connection: keep-alive`.

## Testes
- Deploy e chamada via Postman com `authorization` e `apikey`:
  - `GET/POST https://<project-ref>.supabase.co/functions/v1/healthcheck/ping`
  - Esperado: `200` com JSON em milissegundos.

## Próximo
- Se esta versão responder corretamente, aplicamos o mesmo padrão em `intake-link`, `intake-get` e `intake-response` para uniformizar o runtime.