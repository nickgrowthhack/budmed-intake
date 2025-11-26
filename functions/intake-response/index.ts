export default async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const token = url.pathname.split('/').filter(Boolean).pop() ?? ''
  const { answers } = await req.json()
  const body = { status: 'received', appointment_id: '', token, submitted_at: new Date().toISOString() }
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })
}
