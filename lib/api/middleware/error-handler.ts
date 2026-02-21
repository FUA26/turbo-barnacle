import { ApiError } from "../errors";
import { apiJsonError } from "../response/api-response";

export type ApiHandler = (req: Request, context?: unknown) => Promise<Response>;

export async function withErrorHandler(...args: Parameters<ApiHandler>): Promise<Response> {
  const [handler, req, context] = args;

  try {
    return await handler(req, context);
  } catch (error) {
    if (error instanceof ApiError) {
      return apiJsonError(error);
    }
    return apiJsonError(error as Error);
  }
}

export function withApiHandler(handler: ApiHandler): ApiHandler {
  return async (req: Request, context?: unknown) => {
    return withErrorHandler(handler, req, context);
  };
}
