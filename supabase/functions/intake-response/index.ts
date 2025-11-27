import { createClient } from "npm:@supabase/supabase-js@2";

export default async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const token = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const { answers } = await req.json()

  let status = 200
  let body: any = { status: 'received', appointment_id: '', token, submitted_at: new Date().toISOString() }

  if (typeof Deno !== 'undefined') {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) {
      status = 500
      body = { error: 'Variáveis de ambiente ausentes', token }
    } else {
      const supabase = createClient(supabaseUrl, serviceKey)
      const { data: link, error: linkError } = await supabase
        .from('intake_links')
        .select('id, appointment_id')
        .eq('token', token)
        .single()
      if (linkError || !link) {
        status = 404
        body = { error: 'Link não encontrado', token }
      } else {
        const { data: resp, error: respError } = await supabase
          .from('intake_responses')
          .upsert({ intake_link_id: link.id, answers }, { onConflict: 'intake_link_id' })
          .select('submitted_at')
          .single()
        if (respError) {
          status = 500
          body = { error: respError.message }
        } else {
          body = { status: 'saved', appointment_id: link.appointment_id, token, submitted_at: resp?.submitted_at || new Date().toISOString() }
        }
      }
    }
  }

  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}
