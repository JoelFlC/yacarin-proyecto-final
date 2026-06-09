import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Extendemos el AuthGuard nativo indicando que use la estrategia 'jwt'
export class JwtAuthGuard extends AuthGuard('jwt') {}