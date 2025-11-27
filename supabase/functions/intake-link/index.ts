import { createClient } from "npm:@supabase/supabase-js@2";

export default async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const appointmentId = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const token = crypto.randomUUID()
  const base =
    (typeof Deno !== 'undefined' && Deno.env.get('PUBLIC_INTAKE_BASE_URL')) ||
    'https://intake.budmed.com.br/patient/'
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
      const timeout = (ms: number) =>
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Supabase request timeout')), ms),
        )

      try {
        const { data, error } = await Promise.race([
          supabase
            .from('intake_links')
            .upsert({ appointment_id: appointmentId, token }, { onConflict: 'appointment_id' })
            .select('token')
            .single(),
          timeout(10000),
        ])

        if (error) {
          status = 500
          body = { error: error.message }
        } else {
          body.token = data?.token || token
        }
      } catch (error: any) {
        status = 504
        body = { error: error?.message || 'Supabase request timeout' }
      }
    }
  }

  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}
