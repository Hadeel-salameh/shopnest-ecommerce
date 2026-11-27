/**
 * Central API client that wraps the native fetch API.
 * Automatically parses JSON and throws an Error with the API's
 * error message when the response is not OK.
 */
export async function apiClient<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });

  let body: Record<string, unknown> = {};
  try {
    body = await response.json();
  } catch {
    // Body might be empty on some responses
  }

  if (!response.ok) {
    const message =
      (body?.error as string) ||
      (body?.message as string) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}
