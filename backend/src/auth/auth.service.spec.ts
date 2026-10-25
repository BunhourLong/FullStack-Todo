import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { QueryFailedError, Repository } from 'typeorm';
import { AuthService } from './auth.service.js';
import { User } from './entities/user.entity.js';

// In-memory stand-in for the User repository: just the calls AuthService makes.
const fakeRepo = () => {
  const users: User[] = [];
  return {
    create: (u: Partial<User>) => u,
    save: async (u: User) => {
      if (users.some((x) => x.email === u.email))
        throw new QueryFailedError('INSERT', [], Object.assign(new Error('dup'), { code: '23505' }));
      users.push({ ...u, id: users.length + 1, role: 'user', refreshTokenHash: null });
      return users.at(-1);
    },
    findOneBy: async (where: Partial<User>) =>
      users.find((u) => Object.entries(where).every(([k, v]) => u[k as keyof User] === v)) ?? null,
    update: async (id: number, changes: Partial<User>) => Object.assign(users.find((u) => u.id === id)!, changes),
  } as unknown as Repository<User>;
};

describe('AuthService', () => {
  let auth: AuthService;
  const creds = { email: 'Alice@test.dev', password: 'secret123' };

  beforeEach(async () => {
    const config = new ConfigService({ JWT_SECRET: 'a', JWT_REFRESH_SECRET: 'r' });
    auth = new AuthService(fakeRepo(), new JwtService({ secret: 'a' }), config);
    await auth.signup(creds);
  });

  it('signup returns id and lowercased email, never the hash', async () => {
    expect(await auth.signup({ email: 'bob@test.dev', password: 'secret123' })).toEqual({ id: 2, email: 'bob@test.dev' });
  });

  it('signup with a taken email is a 409', async () => {
    await expect(auth.signup({ ...creds, email: 'alice@test.dev' })).rejects.toThrow(ConflictException);
  });

  it('login with a wrong password is a 401', async () => {
    await expect(auth.login({ ...creds, password: 'nope' })).rejects.toThrow(UnauthorizedException);
  });

  it('refresh rotates the token, and replaying an old one ends the session', async () => {
    const first = await auth.login(creds);
    const second = await auth.refresh(first.refreshToken);
    expect(second.refreshToken).not.toBe(first.refreshToken);

    await expect(auth.refresh(first.refreshToken)).rejects.toThrow(UnauthorizedException);
    // The replay revoked the session, so even the newest token is dead now.
    await expect(auth.refresh(second.refreshToken)).rejects.toThrow(UnauthorizedException);
  });

  it('logout makes the refresh token unusable', async () => {
    const { refreshToken } = await auth.login(creds);
    await auth.logout(refreshToken);
    await expect(auth.refresh(refreshToken)).rejects.toThrow(UnauthorizedException);
  });

  it('an access token is not accepted as a refresh token', async () => {
    const { accessToken } = await auth.login(creds);
    await expect(auth.refresh(accessToken)).rejects.toThrow(UnauthorizedException);
  });
});
