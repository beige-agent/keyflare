import type { ApiResponse, ApiErrorResponse } from "@keyflare/shared";
import { getApiUrl, readApiKey } from "../config.js";

export class KeyflareApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "KeyflareApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  apiKeyOverride?: string
): Promise<T> {
  const apiUrl = getApiUrl().replace(/\/$/, "");
  const apiKey = apiKeyOverride ?? readApiKey();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  let res: Response;
  try {
    res = await fetch(`${apiUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err: any) {
    throw new KeyflareApiError(
      "NETWORK_ERROR",
      `Cannot reach API at ${apiUrl}: ${err.message}`,
      0
    );
  }

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.ok) {
    const err = (json as ApiErrorResponse).error;
    throw new KeyflareApiError(err.code, err.message, res.status);
  }

  return (json as { ok: true; data: T }).data;
}

export const api = {
  get: <T>(path: string, apiKey?: string) =>
    request<T>("GET", path, undefined, apiKey),

  post: <T>(path: string, body?: unknown, apiKey?: string) =>
    request<T>("POST", path, body, apiKey),

  put: <T>(path: string, body: unknown, apiKey?: string) =>
    request<T>("PUT", path, body, apiKey),

  patch: <T>(path: string, body: unknown, apiKey?: string) =>
    request<T>("PATCH", path, body, apiKey),

  delete: <T>(path: string, apiKey?: string) =>
    request<T>("DELETE", path, undefined, apiKey),
};
