import { createClient } from "npm:@supabase/supabase-js@2";

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const t = new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), ms));
  return Promise.race([p, t]) as Promise<T>;
}

export default async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const appointmentId = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const token = crypto.randomUUID()
  const base = (typeof Deno !== 'undefined' && Deno.env.get('PUBLIC_INTAKE_BASE_URL')) || 'https://intake.budmed.com.br/patient/'
  const patientLink = `${base}?token=${token}`

  let status = 200
  let body: any = { appointment_id: appointmentId, token, patient_link: patientLink }

  if (typeof Deno !== 'undefined') {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) {
      status = 500
      body = { error: 'Variáveis de ambiente ausentes', appointment_id: appointmentId, token, patient_link: patientLink }
    } else {
      const supabase = createClient(supabaseUrl, serviceKey)
      try {
        const { error } = await withTimeout(
          supabase
            .from('intake_links')
            .upsert({ appointment_id: appointmentId, token }, { onConflict: 'appointment_id' }),
          25000
        )
        if (error) {
          status = 500
          body = { error: error.message }
        } else {
          body.token = token
        }
      } catch (e) {
        status = e instanceof Error && e.message === 'timeout' ? 504 : 500
        body = { error: e instanceof Error ? e.message : 'Erro desconhecido' }
      }
    }
  }

  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}
