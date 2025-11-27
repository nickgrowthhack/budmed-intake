import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

console.info('server started')

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const token = url.pathname.split('/').filter(Boolean).pop() ?? ''
  console.log('intake-response start', { method: req.method, path: url.pathname, token })

  let payload: any = {}
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'body inválido' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
  }
  const { answers } = payload

  let status = 200
  let body: any = { status: 'received', appointment_id: '', token, submitted_at: new Date().toISOString() }

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
    status = 500
    body = { error: 'Variáveis de ambiente ausentes', token }
  } else {
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
        status = 404
        body = { error: 'Link não encontrado', token }
      } else {
        const { data: existing } = await withTimeout(
          supabase
            .from('intake_responses')
            .select('id, submitted_at')
            .eq('intake_link_id', link.id)
            .maybeSingle(),
          7000
        )
        if (existing) {
          status = 409
          body = { error: 'Já enviado', appointment_id: link.appointment_id, token, submitted_at: existing.submitted_at }
        } else {
          const { data: resp, error: respError } = await withTimeout(
            supabase
              .from('intake_responses')
              .insert({ intake_link_id: link.id, answers })
              .select('submitted_at')
              .single(),
            7000
          )
          if (respError) {
            const code = (respError as any)?.code || ''
            const msg = String(respError.message || '')
            if (code === '409' || msg.includes('duplicate key') || msg.includes('already exists')) {
              status = 409
              body = { error: 'Já enviado', appointment_id: link.appointment_id, token }
            } else {
              status = 500
              body = { error: respError.message }
            }
          } else {
            body = { status: 'saved', appointment_id: link.appointment_id, token, submitted_at: resp?.submitted_at || new Date().toISOString() }
          }
        }
      }
    } catch (e: any) {
      if (e && e.message === 'timeout') {
        status = 504
        body = { error: 'timeout' }
      } else {
        status = 500
        body = { error: String(e?.message || e) }
      }
    }
  }

  console.log('intake-response end', { status })
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
})
