"use client";

// OAuth 2.1 consent screen — the `authorization_endpoint` sentinel advertises to MCP
// clients (ChatGPT / claude.ai). The user is sent here with the OAuth params; once they
// approve, we ask sentinel (via the proxy, authenticated with the user's token) to mint
// an authorization code, then redirect back to the connector's callback with it.

import { useEffect, useState } from "react";
import { getToken, refreshAccessToken } from "@/lib/api/token";

interface Params {
  responseType: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string;
}

function readParams(): Params {
  const q = new URLSearchParams(window.location.search);
  return {
    responseType: q.get("response_type") ?? "",
    clientId: q.get("client_id") ?? "",
    redirectUri: q.get("redirect_uri") ?? "",
    scope: q.get("scope") ?? "memory",
    state: q.get("state") ?? "",
    codeChallenge: q.get("code_challenge") ?? "",
    codeChallengeMethod: q.get("code_challenge_method") ?? "",
    resource: q.get("resource") ?? "",
  };
}

function redirectBack(redirectUri: string, params: Record<string, string>) {
  const url = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  window.location.href = url.toString();
}

export default function OAuthAuthorizePage() {
  const [params, setParams] = useState<Params | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const p = readParams();
    setParams(p);
    if (p.responseType !== "code" || !p.clientId || !p.redirectUri || !p.codeChallenge) {
      setError("This authorization request is missing required parameters.");
      return;
    }
    // Require a logged-in user; bounce to login (returning here) if absent.
    (async () => {
      let token = getToken();
      if (!token) token = (await refreshAccessToken()) ?? "";
      if (!token) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}`;
      }
    })();
  }, []);

  async function approve() {
    if (!params) return;
    setBusy(true);
    setError("");
    try {
      const token = getToken() || (await refreshAccessToken()) || "";
      const res = await fetch("/api/proxy/oauth/code", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          client_id: params.clientId,
          redirect_uri: params.redirectUri,
          code_challenge: params.codeChallenge,
          scope: params.scope,
          resource: params.resource,
        }),
      });
      const json = await res.json();
      if (!json?.success || !json.data?.code) {
        setError("Could not authorize this connection. Please try again.");
        setBusy(false);
        return;
      }
      redirectBack(params.redirectUri, { code: json.data.code, state: params.state });
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  function deny() {
    if (!params) return;
    redirectBack(params.redirectUri, { error: "access_denied", state: params.state });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-white">Connect to Open Stash</h1>
        <p className="mt-3 text-sm text-neutral-300">
          An AI assistant wants to access your <strong>Open Stash memory</strong>: to save
          and recall facts you choose to share with it across conversations.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-neutral-400">
          <li>• Read your saved memories to personalize answers</li>
          <li>• Save new facts you ask it to remember</li>
        </ul>
        {error ? (
          <p className="mt-4 rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300">{error}</p>
        ) : null}
        <div className="mt-6 flex gap-3">
          <button
            onClick={deny}
            disabled={busy || !params}
            className="flex-1 rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-800 disabled:opacity-50"
          >
            Deny
          </button>
          <button
            onClick={approve}
            disabled={busy || !params || !!error}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
          >
            {busy ? "Authorizing…" : "Allow"}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-neutral-500">
          You can revoke this anytime in Settings.
        </p>
      </div>
    </div>
  );
}
