import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogAccesoService } from './log-acceso.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly logService: LogAccesoService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();

        const ip = req.ip || req.connection?.remoteAddress || 'IP Desconocida';
        const browser = req.headers['user-agent'] || 'Browser Desconocido';
        const url = req.url;
        const method = req.method;

        // Ignorar GET para no saturar los logs
        if (method === 'GET') {
            return next.handle();
        }

        return next.handle().pipe(
            tap((data) => {
                let evento = `${method} ${url}`;
                let usuarioId = req.user?.id; 

                if (url.includes('/auth/login')) {
                    evento = 'INICIO DE SESIÓN';
                    if (data && data.usuario_id) {
                        usuarioId = data.usuario_id;
                    }
                } else if (url.includes('/auth/logout')) {
                    evento = 'CIERRE DE SESIÓN';
                } else if (method === 'POST') {
                    evento = `CREAR REGISTRO (${url})`;
                } else if (method === 'PATCH' || method === 'PUT') {
                    evento = `EDITAR REGISTRO (${url})`;
                } else if (method === 'DELETE') {
                    evento = `ELIMINAR REGISTRO (${url})`;
                }

                console.log(`[Audit] Guardando evento: ${evento} para URL: ${url}`);
                
                this.logService.registrarAcceso(ip, evento, browser, usuarioId)
                .catch(err => console.error('Error en Auditoría:', err));
            })
        );
    }
    }