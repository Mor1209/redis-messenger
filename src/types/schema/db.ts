import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(1).max(35).optional(),
  username: z.string().min(3).max(25).optional(),
  email: z.string().email().min(3).max(35).optional(),
  image: z.string().min(1).optional(),
  id: z.string().uuid(),
});
