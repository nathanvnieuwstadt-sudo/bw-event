// Mirrors com.bwevent.config.ApiResponse: null/undefined fields are omitted.

export function success<T>(data: T, message?: string) {
  const body: Record<string, unknown> = { data, timestamp: new Date().toISOString() };
  if (message !== undefined) body.message = message;
  return body;
}

export function errorBody(error: string, status: number) {
  return { error, status, timestamp: new Date().toISOString() };
}
