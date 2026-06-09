# Yacarín E-Commerce & ERP (v2.0)

**Materia:** Desarrollo WEB Backend

Plataforma integral híbrida (E-commerce B2B/B2C + ERP de Producción) para la empresa "Yacarín Confecciones". El sistema gestiona ventas públicas, catálogos mayoristas, logística de envíos, control de inventario y el pago a destajo del personal de confección.

## Tecnologías Utilizadas
- **Frontend:** React + Vite, TailwindCSS, Zustand, Chart.js
- **Backend:** NestJS, TypeORM, PostgreSQL, JWT Auth, NodeMailer
- **Infraestructura:** Docker, Docker Compose, Kubernetes

## Estructura del Proyecto
- `/yacarin-frontend`: Interfaz de usuario (React)
- `/yacarin-backend`: API y lógica de negocio (NestJS)
- `/k8s`: Manifiestos de Kubernetes

## Despliegue Local (Docker Compose)
Para ejecutar este proyecto de forma local con contenedores:
```bash
docker-compose up --build -d
```
Esto levantará la base de datos PostgreSQL, el backend en el puerto 3000 y el frontend en el puerto 5173.
