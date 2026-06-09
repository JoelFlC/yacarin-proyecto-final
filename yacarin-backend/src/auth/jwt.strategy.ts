import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
        // Le decimos que busque el token en la cabecera 'Authorization' como un Bearer Token
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false, // Rechaza tokens vencidos
        secretOrKey: configService.get<string>('JWT_SECRET')!, // Usamos la misma llave secreta
        });
    }

    // Si el token es válido, Passport ejecuta esta función y nos devuelve la carga útil (Payload)
    async validate(payload: any) {
        // Retornamos el ID y el email del usuario para que estén disponibles en el endpoint
        return { id: payload.sub, email: payload.email }; 
    }
}