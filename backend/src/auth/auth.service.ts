import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { QueryFailedError, Repository } from 'typeorm';
import { LoginDto, SignupDto } from './dto/credentials.dto.js';
import { User } from './entities/user.entity.js';

export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup({ email, password }: SignupDto) {
    try {
      const user = await this.repo.save(
        this.repo.create({ email: email.toLowerCase(), passwordHash: await argon2.hash(password) }),
      );
      return { id: user.id, email: user.email };
    } catch (e) {
      // 23505 = unique_violation: the email is taken (also covers two signups racing).
      if (e instanceof QueryFailedError && (e.driverError as { code?: string }).code === '23505')
        throw new ConflictException('Email already registered');
      throw e;
    }
  }

  async login({ email, password }: LoginDto) {
    const user = await this.repo.findOneBy({ email: email.toLowerCase() });
    if (!user || !(await argon2.verify(user.passwordHash, password)))
      throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  // Rotation: every refresh token works once. The new one replaces it in the database.
  async refresh(token?: string) {
    const user = await this.userFromRefreshToken(token);
    if (!user?.refreshTokenHash) throw new UnauthorizedException();
    if (!(await argon2.verify(user.refreshTokenHash, token!))) {
      // A real but already-used token came back, so assume it was stolen: end the session.
      await this.repo.update(user.id, { refreshTokenHash: null });
      throw new UnauthorizedException();
    }
    return this.issueTokens(user);
  }

  async logout(token?: string) {
    const user = await this.userFromRefreshToken(token);
    if (user) await this.repo.update(user.id, { refreshTokenHash: null });
  }

  private async userFromRefreshToken(token?: string) {
    const payload = await this.jwt
      .verifyAsync<{ sub: number }>(token ?? '', { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') })
      .catch(() => null);
    return payload && this.repo.findOneBy({ id: payload.sub });
  }

  // shortcut: one refresh hash per user, so logging in on a second device logs out the first; add a sessions table if multi-device matters.
  private async issueTokens(user: User) {
    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: crypto.randomUUID() },
      { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: REFRESH_TTL_SECONDS },
    );
    await this.repo.update(user.id, { refreshTokenHash: await argon2.hash(refreshToken) });
    return { accessToken, refreshToken };
  }
}
