import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) 
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  registrarCliente(@Body() registerDto: RegisterDto) {
    return this.authService.registrarCliente(registerDto);
  }

  @Post('forgot-password')
  solicitarRecuperacion(@Body('email') email: string) {
    return this.authService.solicitarRecuperacion(email);
  }

  @Post('reset-password')
  restablecerPassword(
    @Body('email') email: string,
    @Body('token') token: string,
    @Body('nuevaPassword') nuevaPassword: string,
  ) {
    return this.authService.restablecerPassword(email, token, nuevaPassword);
  }
}