import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { redis } from "~/server/db";
import { type User } from "~/types/db";
import { UserSchema } from "~/types/schema/db";
import { fetchRedis } from "~/utils/redis";

export const userRouter = createTRPCRouter({
  getUsersByUsername: protectedProcedure
    .input(z.string().min(1).max(25))
    .query(async ({ input }) => {
      console.log("input in backend");
      console.log(input);
      const fetchedUsers = (
        await fetchRedis("sscan", "usernames", 0, "match", `${input}*`)
      )?.at(1) as string[];

      const foundUsers = fetchedUsers.map((usernameId) => {
        const [username, userId] = usernameId.split("--");
        return { username, userId };
      });

      return foundUsers;
    }),
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
      const fetchedUser = (await fetchRedis("get", `user:${id}`)) as
        | string
        | null;

      console.log("user:");
      console.log(fetchedUser);
      if (!fetchedUser)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User does not exist anymore",
        });

      const oldUser = JSON.parse(fetchedUser) as User;
      const updatedUser = { ...oldUser, ...input } as User;

      try {
        // if username is updated update seconday index of username as well
        if (input.username) {
          // clean username input from prohibited charater sequence
          const username = input.username.trim().replaceAll("--", "-");

          // if no username is defined on the current user set username directly
          // else delete old username index at the same time
          if (!oldUser.username) {
            await redis
              .pipeline()
              .set(`user:${id}`, JSON.stringify(updatedUser))
              .sadd("usernames", `${username}--${updatedUser.id}`)
              .exec();
          } else {
            await redis
              .pipeline()
              .set(`user:${id}`, JSON.stringify(updatedUser))
              .srem("usernames", `${oldUser.username}--${updatedUser.id}`)
              .sadd("usernames", `${username}--${updatedUser.id}`)
              .exec();
          }
        } else {
          await redis.set(`user:${id}`, JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Can't update user",
        });
      }

      return updatedUser;
    }),
});
