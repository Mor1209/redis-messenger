import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { redis } from "~/server/db";
import { type User } from "~/types/db";
import { UserSchema } from "~/types/schema/db";
import { fetchRedis } from "~/utils/redis";

export const userRouter = createTRPCRouter({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),
  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
  updateCurrentUser: protectedProcedure
    .input(
      UserSchema.omit({ id: true }).refine(
        (obj: Record<string | number | symbol, unknown>) =>
          Object.values(obj).some((v) => v !== undefined),
        { message: "No attributes to update given" }
      )
    )
    .mutation(async ({ input, ctx }) => {
      const {
        user: { id },
      } = ctx.session;
      const user = await fetchRedis("get", `user:${id}`);

      console.log("user:");
      console.log(user);
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User does not exist anymore",
        });

      const updatedUser = { ...JSON.parse(user), ...input } as User;

      try {
        await redis.set(`user:${id}`, JSON.stringify(updatedUser));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't update user",
        });
      }

      return updatedUser;
    }),
});
