import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@rpg/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login/master')
  loginMaster(@Body() dto: LoginDto) {
    return this.authService.loginAsRole(dto, UserRole.Master);
  }

  @Post('login/player')
  loginPlayer(@Body() dto: LoginDto) {
    return this.authService.loginAsRole(dto, UserRole.Player);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user: this.authService.getPublicUser(user) };
  }
}
