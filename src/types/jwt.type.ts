import { UserRole } from "src/generated/prisma/enums";

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
}
