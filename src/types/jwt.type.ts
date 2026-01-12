import { UserRole } from "./web.type";

export interface UserPayload {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
}
