import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { Public } from './auth.decorators.js';
import { AuthService, REFRESH_TTL_SECONDS } from './auth.service.js';
import { LoginDto, SignupDto } from './dto/credentials.dto.js';

const COOKIE = 'refresh_token';
// HttpOnly keeps it away from page scripts; the path limits it to these auth routes.
const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
};

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.sendTokens(res, await this.authService.login(dto));
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.sendTokens(res, await this.authService.refresh(req.cookies[COOKIE]));
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies[COOKIE]);
    res.clearCookie(COOKIE, cookieOptions);
  }

  private sendTokens(res: Response, { accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    res.cookie(COOKIE, refreshToken, { ...cookieOptions, maxAge: REFRESH_TTL_SECONDS * 1000 });
    return { accessToken };
  }
}
