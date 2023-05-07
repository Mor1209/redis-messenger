import { type GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { redis } from "./db";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env.mjs";
import { fetchRedis } from "~/utils/redis";
import { v4 as uuidv4 } from "uuid";
import type { User } from "~/types/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(redis),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("in jwt callback");
      console.log(user);
      console.log(token);
      const dbUserResult = (await fetchRedis(
        "get",
        `user:${token.userId}`
      )) as string;

      if (!dbUserResult) {
        if (user) {
          token.userId = user.id;
        }

        return token;
      }

      const dbUser = JSON.parse(dbUserResult) as User;

      return {
        userId: dbUser.id,
        name: dbUser.name,
        username: dbUser.username,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.userId,
        name: token.name,
        username: token.username,
        email: token.email,
        image: token.picture,
      },
    }),
    redirect() {
      return "/dashboard";
    },
  },
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Demo",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {},
      // credentials: { demo: { label: "demo", type: "boolean" } },
      async authorize() {
        // lgoic for password username not need, credential provider only in use
        // for demo account purposes

        // console.log(credentials);
        // if (
        //   !credentials?.username ||
        //   !credentials?.email ||
        //   !credentials?.password
        // )
        //   return null;

        // const userId = await fetchRedis(
        //   "get",
        //   `user:email${credentials.email}`
        // );

        // if (userId && typeof userId === "string") {
        //   const fetchUser = await fetchRedis("get", `user:${userId}`);

        //   if (fetchUser) {
        //     const dbUser = JSON.parse(fetchUser) as User;
        //     if (dbUser.password !== credentials.password) return null;
        //     return dbUser;
        //   }
        // }

        const user: User = {
          name: "Demo",
          id: uuidv4(),
        };

        try {
          await redis.set(`user:${user.id}`, JSON.stringify(user));
        } catch (error) {
          console.log(
            "error in auth credential provider, trying to set new user"
          );
        }

        return user;
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
