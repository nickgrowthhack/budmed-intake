import { createClient } from 'supabase';

export default async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const appointmentId = url.pathname.split('/').filter(Boolean).pop() ?? ''

  let status = 200
  let body: any = { appointment_id: appointmentId, answers: null, submitted_at: null }

  if (typeof Deno !== 'undefined') {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) {
      status = 500
      body = { error: 'Variáveis de ambiente ausentes', appointment_id: appointmentId }
    } else {
      const supabase = createClient(supabaseUrl, serviceKey)
      const { data: link, error: linkError } = await supabase
        .from('intake_links')
        .select('id, token')
        .eq('appointment_id', appointmentId)
        .single()
      if (!link || linkError) {
        status = 200
        body = { appointment_id: appointmentId, answers: null, submitted_at: null }
      } else {
        const { data: resp } = await supabase
          .from('intake_responses')
          .select('answers, submitted_at')
          .eq('intake_link_id', link.id)
          .maybeSingle()
        if (resp) {
          body = { appointment_id: appointmentId, answers: resp.answers, submitted_at: resp.submitted_at }
        } else {
          body = { appointment_id: appointmentId, answers: null, submitted_at: null }
        }
      }
    }
  }

  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}
