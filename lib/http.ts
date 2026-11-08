import { z } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok)
    throw new ApiError(
      response.status === 429
        ? "Request rate limited (429)"
        : `Request failed (${response.status})`,
      response.status,
    );
  return schema.parse(await response.json());
}

/** Retry transient transport/server failures, never invalid data or client errors. */
export function retryApiRequest(count: number, error: unknown) {
  if (error instanceof z.ZodError || (error instanceof Error && error.name === "AbortError"))
    return false;
  const status =
    error && typeof error === "object" && "status" in error && typeof error.status === "number"
      ? error.status
      : undefined;
  return count < 2 && (status === undefined || status === 429 || status >= 500);
}
export const apiRetryDelay = (attempt: number) => Math.min(1000 * 2 ** attempt, 5000);
