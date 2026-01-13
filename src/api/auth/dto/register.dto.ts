import z from "zod";

import { User } from "src/generated/prisma/client";
import { UserRole, UserStatus } from "src/generated/prisma/enums";

export const registerSchema = z
  .object({
    username: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
  })
  .strict()
  .transform((data) => ({
    ...data,
    roles: [UserRole.USER],
    status: UserStatus.INACTIVE,
  }));
export type RegisterDto = z.infer<typeof registerSchema>;
export type RegisterResponseDto = Pick<
  User,
  "id" | "username" | "email" | "roles" | "status"
>;
export const toRegisterResponse = (user: User): RegisterResponseDto => ({
  id: user.id,
  username: user.username,
  email: user.email,
  roles: user.roles,
  status: user.status,
});
