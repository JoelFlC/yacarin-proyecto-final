import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: true, // true para port 465
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
        });
    }

    async enviarCorreoBienvenida(email: string, nombre: string) {
        try {
        await this.transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: '¡Bienvenido a Yacarín Confecciones! 🧸',
            html: `
            <div style="font-family: 'Helvetica', sans-serif; color: #2C3E50; padding: 20px;">
                <h1 style="color: #5FA8D3;">¡Hola ${nombre}!</h1>
                <p>Nos alegra muchísimo que te unas a la familia Yacarín.</p>
                <p>Tu cuenta ha sido creada exitosamente. Ya puedes acceder a nuestro catálogo bimonetario y realizar tus pedidos de ropa para bebé con la mejor calidad.</p>
                <br/>
                <p><strong>Cariño que abraza,</strong><br/>El equipo de Yacarín.</p>
            </div>
            `,
        });
        } catch (error) {
        console.error('Error al enviar correo:', error);
        // No lanzamos excepción para no cancelar el registro si el correo falla
        }
    }

    async enviarCorreoRecuperacion(email: string, token: string) {
    try {
        await this.transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Recuperación de Contraseña - Yacarín',
            html: `
            <div style="font-family: 'Helvetica', sans-serif; color: #2C3E50; padding: 20px;">
                <h2 style="color: #5FA8D3;">Recuperación de Contraseña</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p>Tu código de seguridad de 6 dígitos es:</p>
                <div style="background-color: #F0F6F9; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #2C3E50; border-radius: 8px; margin: 20px 0;">
                ${token}
                </div>
                <p><em>Este código expirará en 15 minutos.</em></p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            </div>
            `,
        });
        } catch (error) {
        console.error('Error al enviar correo de recuperación:', error);
        throw new InternalServerErrorException('No se pudo enviar el correo de recuperación');
        }
    }
}