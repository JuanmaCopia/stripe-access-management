import NextAuth from "next-auth";
import { createWebAuthOptionsFromEnv } from "../../../../src/server/auth/config";

async function authRouteHandler(
  request: Request,
  context: Parameters<ReturnType<typeof NextAuth>>[1]
) {
  const handler = NextAuth(createWebAuthOptionsFromEnv());

  return handler(request, context);
}

export { authRouteHandler as GET, authRouteHandler as POST };
