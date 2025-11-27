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

  const url = new URL(req.url)
  const appointmentId = url.pathname.split('/').filter(Boolean).pop() ?? ''
  console.log('intake-get start', { method: req.method, path: url.pathname, appointmentId })

  let status = 200
  let body: any = { appointment_id: appointmentId, answers: null, submitted_at: null }

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
    body = { error: 'Variáveis de ambiente ausentes', appointment_id: appointmentId }
  } else {
    try {
      const supabase = createClient(supabaseUrl, serviceKey, { global: { fetch: fetchWithTimeout } })
      const { data: link } = await withTimeout(
        supabase
          .from('intake_links')
          .select('id, token')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        7000
      )
      if (!link) {
        status = 200
        body = { appointment_id: appointmentId, answers: null, submitted_at: null }
      } else {
        const { data: resp } = await withTimeout(
          supabase
            .from('intake_responses')
            .select('answers, submitted_at')
            .eq('intake_link_id', link.id)
            .maybeSingle(),
          7000
        )
        if (resp) {
          body = { appointment_id: appointmentId, answers: resp.answers, submitted_at: resp.submitted_at }
        } else {
          body = { appointment_id: appointmentId, answers: null, submitted_at: null }
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

  console.log('intake-get end', { status })
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
})
