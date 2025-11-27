## Objetivo
- Isolar o ambiente: criar uma função Edge mínima e verificar se o deploy e as respostas HTTP funcionam.

## Implementação (nova função)
- Arquivo: `supabase/functions/healthcheck/index.ts`
- Comportamento:
  - Responde a `GET` e `POST` com JSON `{ ok: true, now, method, path }`.
  - Trata `OPTIONS` com CORS (`Access-Control-Allow-Origin: *`, `authorization, x-client-info, apikey, content-type`).
  - Não usa banco nem libs, para eliminar variáveis externas.
- Código:
```
export default async function handleRequest(req: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }
  const url = new URL(req.url)
  const body = { ok: true, now: new Date().toISOString(), method: req.method, path: url.pathname }
  return new Response(JSON.stringify(body), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json' } })
}
```

## Deploy
- No diretório do projeto:
  - `supabase login`
  - `supabase link --project-ref urxchkxvcvdwmkjmokkq`
  - `supabase functions deploy healthcheck`
- A função não precisa de variáveis de ambiente.

## Testes (Postman)
- `GET` ou `POST` `https://urxchkxvcvdwmkjmokkq.supabase.co/functions/v1/healthcheck/ping`
- Headers obrigatórios:
  - `authorization: Bearer <ANON_KEY>`
  - `apikey: <ANON_KEY>`
- Esperado: `200` com `{ ok: true, now, method, path }` em poucos milissegundos.

## Próximo Passo
- Com sua confirmação, crio o arquivo, faço o deploy e te envio os resultados dos testes no Postman (ou executo local com `serve` se preferir).