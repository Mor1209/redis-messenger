import type { z } from "zod";
import type { UserSchema } from "./schema/db";

export type User = z.infer<typeof UserSchema>;
