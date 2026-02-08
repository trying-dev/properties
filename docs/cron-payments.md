# Cron de pagos mensuales

Este proyecto genera pagos mensuales para contratos activos el día 1 de cada mes (con vencimiento el día 5).

## Qué hace

- Busca contratos con `status = ACTIVE`.
- Crea un pago `PENDING` por contrato si no existe para el mes actual.
- Vence el día 5 del mes.
- Es idempotente (si el cron corre dos veces, no duplica pagos).

## Alertas diarias

- Marca pagos como `OVERDUE` cuando pasa la fecha de vencimiento.
- Envía notificaciones de pagos vencidos.
- Envía recordatorios cuando faltan pocos días para vencer.

## Endpoint

Ruta:

- `GET /api/cron/payments`

Seguridad:

- Define `CRON_SECRET` en el entorno.
- Vercel cron agrega el header `Authorization` con el token configurado.
- Se valida con: `Authorization: Bearer <CRON_SECRET>`.

## Configuración en Vercel

Archivo `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/payments",
      "schedule": "1 5 1 * *"
    },
    {
      "path": "/api/cron/alerts",
      "schedule": "5 5 * * *"
    }
  ]
}
```

Notas:

- Vercel usa UTC para `schedule`.
- `1 5 1 * *` equivale a 00:01 en `America/Bogota`.
- `5 5 * * *` equivale a 00:05 diario en `America/Bogota` para alertas de vencimiento y recordatorios.

## Probar manualmente

Producción:

```bash
curl -H "Authorization: Bearer CRON_SECRET" https://tu-dominio.com/api/cron/payments
curl -H "Authorization: Bearer CRON_SECRET" https://tu-dominio.com/api/cron/alerts
```

Local:

```bash
curl -H "Authorization: Bearer CRON_SECRET" http://localhost:3000/api/cron/payments
curl -H "Authorization: Bearer CRON_SECRET" http://localhost:3000/api/cron/alerts
```

Reemplaza `CRON_SECRET` por el valor real configurado.

## Variables de entorno

- `CRON_SECRET`: token privado para autorizar el cron.
- `TZ`: recomendable `America/Bogota` para evitar desfases de fecha.
