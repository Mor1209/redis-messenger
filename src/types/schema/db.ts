import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  email: z.string().email().min(1).optional(),
  image: z.string().min(1).optional(),
  id: z.string().min(1),
});
