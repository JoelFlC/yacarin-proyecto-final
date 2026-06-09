import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LogAccesoService } from './log-acceso.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    // Inyectamos nuestro servicio para poder guardar en la BD
    constructor(private readonly logService: LogAccesoService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();

        // 1. Extraemos los datos técnicos
        const ip = req.ip || req.connection?.remoteAddress || 'IP Desconocida';
        const browser = req.headers['user-agent'] || 'Browser Desconocido';
        const evento = `${req.method} ${req.url}`; // Ej: "GET /usuarios"
        
        // 2. Si el usuario pasó por el JWT Guard, su ID estará aquí
        const usuarioId = req.user?.id;

        // 3. Mandamos a guardar a la base de datos. 
        // Usamos .catch() para que si falla la BD, no se le caiga el sistema al usuario.
        this.logService.registrarAcceso(ip, evento, browser, usuarioId)
        .catch(err => console.error('Error en Auditoría:', err));

        // 4. Dejamos que la petición siga su curso normal
        return next.handle();
    }
    }