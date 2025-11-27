import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

console.info('server started')

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
  }

  const url = new URL(req.url)
  const token = url.pathname.split('/').filter(Boolean).pop() ?? ''
  console.log('intake-validate start', { method: req.method, path: url.pathname, token })

  const withTimeout = async <T>(p: Promise<T>, ms: number): Promise<T> => {
    return await Promise.race<T>([
      p,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), ms)
      }) as Promise<T>
    ])
  }

  const fetchWithTimeout = (input: RequestInfo, init: RequestInit = {}) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 7000)
    const headers = new Headers(init.headers || {})
    const nextInit: RequestInit = { ...init, signal: controller.signal, headers }
    return fetch(input, nextInit).finally(() => clearTimeout(id))
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Variáveis de ambiente ausentes' }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { global: { fetch: fetchWithTimeout } })
    const { data: link } = await withTimeout(
      supabase
        .from('intake_links')
        .select('id, appointment_id')
        .eq('token', token)
        .maybeSingle(),
      7000
    )
    if (!link) {
      return new Response(JSON.stringify({ valid: false }), { status: 404, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
    }
    const { data: resp } = await withTimeout(
      supabase
        .from('intake_responses')
        .select('submitted_at')
        .eq('intake_link_id', link.id)
        .maybeSingle(),
      7000
    )
    const submitted = !!resp
    return new Response(JSON.stringify({ valid: true, appointment_id: link.appointment_id, submitted }), { status: 200, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
  } catch (e: any) {
    if (e && e.message === 'timeout') {
      return new Response(JSON.stringify({ error: 'timeout' }), { status: 504, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
    }
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
  }
})
