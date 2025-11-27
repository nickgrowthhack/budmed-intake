import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.info('server started')

Deno.serve(async (req) => {
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
  return new Response(JSON.stringify(body), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
})
