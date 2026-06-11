import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ClientesModule } from './clientes/clientes.module';
import { AdministradoresModule } from './administradores/administradores.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { DisenosModule } from './disenos/disenos.module';
import { ProductosModule } from './productos/productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { MaterialesModule } from './materiales/materiales.module';
import { TipoCambioModule } from './tipo-cambio/tipo-cambio.module';
import { RecetaMaterialModule } from './receta-material/receta-material.module';
import { AuthModule } from './auth/auth.module';

import { LogAccesoModule } from './log-acceso/log-acceso.module';
import { AuditInterceptor } from './log-acceso/audit.interceptor';
import { PedidosModule } from './pedidos/pedidos.module';
import { OrdenProduccionModule } from './orden-produccion/orden-produccion.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MailModule } from './mail/mail.module';
import { RegistroProduccionModule } from './registro-produccion/registro-produccion.module';
import { TarifasModule } from './tarifas/tarifas.module';
import { DireccionEnvioModule } from './direccion-envio/direccion-envio.module';
import { PagoModule } from './pago/pago.module';
import { CompraMaterialModule } from './compra-material/compra-material.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    // 1. Cargamos las variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en todo el proyecto
    }),
    
    // 2. Configuramos TypeORM inyectando las variables de entorno
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          ...(databaseUrl 
            ? { 
                url: databaseUrl,
                ssl: { rejectUnauthorized: false } 
              } 
            : {
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
            }),
          autoLoadEntities: true, // Carga las entidades automáticamente
          synchronize: true, // Sincroniza el código con la BD (Solo usar en desarrollo)
        };
      },
    }),
    
    UsuariosModule,
    ClientesModule,
    AdministradoresModule,
    EmpleadosModule,
    DisenosModule,
    ProductosModule,
    ProveedoresModule,
    MaterialesModule,
    TipoCambioModule,
    RecetaMaterialModule,
    AuthModule,
    LogAccesoModule,
    PedidosModule,
    OrdenProduccionModule,
    DashboardModule,
    MailModule,
    RegistroProduccionModule,
    TarifasModule,
    DireccionEnvioModule,
    PagoModule,
    CompraMaterialModule,
    CloudinaryModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Activamos el Interceptor globalmente para todas las rutas
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}