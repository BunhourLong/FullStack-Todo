import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export type AuthUser = { id: number; email: string; role: string };

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

export const ROLES = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles);

// The AuthUser that JwtStrategy.validate put on the request.
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
