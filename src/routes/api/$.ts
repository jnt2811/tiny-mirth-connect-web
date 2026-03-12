import { createFileRoute } from "@tanstack/react-router";
import { Agent } from "undici";

const MIRTH_HOST = process.env.MIRTH_HOST || "10.8.0.184";
const MIRTH_PORT = process.env.MIRTH_PORT || "8443";
const MIRTH_BASE = `https://${MIRTH_HOST}:${MIRTH_PORT}`;
const agent = new Agent({ connect: { rejectUnauthorized: false } });

async function proxyToMirth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = MIRTH_BASE + url.pathname + url.search;

  const headers = new Headers(request.headers);
  headers.set("host", `${MIRTH_HOST}:${MIRTH_PORT}`);

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    // @ts-ignore - undici dispatcher for self-signed cert
    dispatcher: agent,
  });

  const responseHeaders = new Headers(response.headers);

  // Rewrite Set-Cookie headers: strip Secure flag and Domain attribute so the
  // browser stores cookies for the proxy host instead of the Mirth host.
  // Without this, browsers reject Secure cookies over plain HTTP (non-localhost).
  const rawCookies = response.headers.getSetCookie?.() ?? [];
  if (rawCookies.length > 0) {
    responseHeaders.delete('set-cookie');
    for (const cookie of rawCookies) {
      const rewritten = cookie
        .replace(/;\s*Secure/gi, '')
        .replace(/;\s*Domain=[^;]*/gi, '');
      responseHeaders.append('set-cookie', rewritten);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: ({ request }) => proxyToMirth(request),
    },
  },
});
