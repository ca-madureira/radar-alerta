import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { z } from "zod";
import { authenticate } from "./authenticate.js";
import { response, fail } from "../utils/http.js";

export type HttpHandler = (
  event: APIGatewayProxyEventV2,
) => Promise<APIGatewayProxyStructuredResultV2>;
type AuthenticatedOperation = (
  event: APIGatewayProxyEventV2,
  userId: string,
) => Promise<APIGatewayProxyStructuredResultV2>;

export function publicHandler(operation: HttpHandler): HttpHandler {
  return async (event) => {
    try {
      if (event.requestContext.http.method === "OPTIONS")
        return response(204, {});
      return await operation(event);
    } catch (error) {
      if (error instanceof z.ZodError)
        return response(400, {
          error: "Dados inválidos",
          details: error.issues,
        });
      return fail(error);
    }
  };
}

export function authenticatedHandler(
  operation: AuthenticatedOperation,
): HttpHandler {
  return publicHandler(async (event) => {
    const userId = await authenticate(
      event.headers.authorization || event.headers.Authorization,
    );
    return operation(event, userId);
  });
}
