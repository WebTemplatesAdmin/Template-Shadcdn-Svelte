import { env } from "$env/dynamic/private";

const API_BASE_URL = env.API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * Wrapper central para todas las peticiones HTTP hacia tu backend.
 * Recibe el `fetch` de SvelteKit (no el global) para que funcione
 * correctamente tanto en SSR como en el navegador.
 */
export async function apiRequest<T>(
  fetchFn: typeof globalThis.fetch,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const res = await fetchFn(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res
      .json()
      .catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, errorBody.message ?? "Error en la petición");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
