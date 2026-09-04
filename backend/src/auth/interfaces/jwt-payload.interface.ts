import type { UserRole } from '@rpg/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}
