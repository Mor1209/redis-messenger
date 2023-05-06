import { env } from "~/env.mjs";
const upstashRedisRestUrl = env.UPSTASH_REDIS_REST_URL;
const authToken = env.UPSTASH_REDIS_REST_TOKEN;

type Command = "zrange" | "sismember" | "get" | "smembers";

/* 
Function returns result for redis data fetch,
applies no caching for requests to get up to date data 
*/
export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join("/")}`;

  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = (await response.json()) as { result: string | null };
  return data.result;
}
