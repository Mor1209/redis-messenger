import type { DefaultSession } from "next-auth";

type UserId = string;

declare module "next-auth/jwt" {
  interface JWT {
    userId: UserId;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: UserId;
    } & DefaultSession["user"];
  }
}
