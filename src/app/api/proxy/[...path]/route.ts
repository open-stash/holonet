import { NextRequest, NextResponse } from "next/server";

const SENTINEL_URL = process.env.SENTINEL_API_URL;

// Hop-by-hop headers — must not be forwarded upstream
const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

// Response headers Next.js manages itself — don't forward back
const SKIP_RESPONSE = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

// Sentinel sets refresh_token with Path=/api/v1/auth (scoped to sentinel).
// Rewrite to Path=/ so the browser includes it on ALL requests — including
// page navigations like /dashboard where proxy.ts checks for it.
function rewriteSetCookiePath(value: string): string {
  return value.replace(/;\s*path=[^;,]*/gi, "; Path=/");
}

interface ProxyParams {
  path: string[];
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<ProxyParams> }
) {
  if (!SENTINEL_URL) {
    return NextResponse.json(
      { success: false, error: "Proxy is not configured." },
      { status: 500 }
    );
  }

  const { path } = await params;
  const targetUrl = `${SENTINEL_URL}/${path.join("/")}${req.nextUrl.search}`;

  // Build forwarded headers — drop hop-by-hop
  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  // Body — only for methods that carry one
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: "manual", // let client handle any 3xx
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not reach the API server. Is it running?" },
      { status: 502 }
    );
  }

  // Forward response headers back to browser
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (SKIP_RESPONSE.has(lower)) return;
    if (lower === "set-cookie") {
      // append — a response can have multiple Set-Cookie headers
      responseHeaders.append(key, rewriteSetCookiePath(value));
    } else {
      responseHeaders.set(key, value);
    }
  });

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const HEAD    = handler;
export const OPTIONS = handler;
