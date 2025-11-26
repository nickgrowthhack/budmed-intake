export default async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const appointmentId = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const token = crypto.randomUUID()
  const base = (typeof Deno !== 'undefined' && Deno.env.get('PUBLIC_INTAKE_BASE_URL')) || 'https://intake.budmed.com.br/patient/'
  const patientLink = `${base}?token=${token}`
  const body = { appointment_id: appointmentId, token, patient_link: patientLink }
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })
}
