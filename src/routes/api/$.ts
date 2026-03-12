import { createFileRoute } from '@tanstack/react-router'
import { Agent } from 'undici'

const MIRTH_BASE = 'https://10.8.0.184:8443'
const agent = new Agent({ connect: { rejectUnauthorized: false } })

async function proxyToMirth(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const targetUrl = MIRTH_BASE + url.pathname + url.search

  const headers = new Headers(request.headers)
  headers.set('host', '10.8.0.184:8443')

  const body = ['GET', 'HEAD'].includes(request.method)
    ? undefined
    : await request.arrayBuffer()

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    // @ts-ignore - undici dispatcher for self-signed cert
    dispatcher: agent,
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      ANY: ({ request }) => proxyToMirth(request),
    },
  },
})
