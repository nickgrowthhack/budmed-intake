import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

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
  const appointmentId = url.pathname.split('/').filter(Boolean).pop() ?? ''
  console.log('intake-link start', { method: req.method, path: url.pathname, appointmentId })
  if (!appointmentId) {
    return new Response(JSON.stringify({ error: 'appointment_id ausente' }), { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
  }

  const base = (typeof Deno !== 'undefined' && Deno.env.get('PUBLIC_INTAKE_BASE_URL')) || 'https://intake.budmed.com.br/patient/'

  let status = 200
  let body: any = { appointment_id: appointmentId, token: '', patient_link: '' }

  const withTimeout = async <T>(p: Promise<T>, ms: number): Promise<T> => {
    return await Promise.race<T>([
      p,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), ms)
      }) as Promise<T>
    ])
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!supabaseUrl || !serviceKey) {
    status = 500
    body = { error: 'Variáveis de ambiente ausentes', appointment_id: appointmentId, token, patient_link: patientLink }
  } else {
    try {
      const fetchWithTimeout = (input: RequestInfo, init: RequestInit = {}) => {
        const controller = new AbortController()
        const id = setTimeout(() => controller.abort(), 7000)
        const headers = new Headers(init.headers || {})
        const nextInit: RequestInit = { ...init, signal: controller.signal, headers }
        return fetch(input, nextInit).finally(() => clearTimeout(id))
      }
      const supabase = createClient(supabaseUrl, serviceKey, { global: { fetch: fetchWithTimeout } })
      const { data: existing } = await withTimeout(
        supabase
          .from('intake_links')
          .select('token')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),
        7000
      )
      let token = existing?.token
      if (!token) {
        token = crypto.randomUUID()
        console.log('intake-link insert begin')
        await withTimeout(
          supabase
            .from('intake_links')
            .upsert({ appointment_id: appointmentId, token }, { onConflict: 'appointment_id', ignoreDuplicates: true }),
          7000
        )
      }
      const patientLink = `${base}?token=${token}`
      const { data, error } = await withTimeout(
        supabase
          .from('intake_links')
          .select('token')
          .eq('appointment_id', appointmentId)
          .single(),
        7000
      )
      if (error) {
        status = 500
        body = { error: error.message }
      } else {
        body.token = data?.token || token
        body.patient_link = patientLink
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

  console.log('intake-link end', { status })
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'content-type': 'application/json', 'Connection': 'keep-alive' } })
})
