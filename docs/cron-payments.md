# Cron de pagos mensuales

Este proyecto genera pagos mensuales para contratos activos el día 1 de cada mes (con vencimiento el día 5).

## Qué hace

- Busca contratos con `status = ACTIVE`.
- Crea un pago `PENDING` por contrato si no existe para el mes actual.
- Vence el día 5 del mes.
- Es idempotente (si el cron corre dos veces, no duplica pagos).

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
    }
  ]
}
```

Notas:

- Vercel usa UTC para `schedule`.
- `1 5 1 * *` equivale a 00:01 en `America/Bogota`.

## Probar manualmente

Producción:

```bash
curl -H "Authorization: Bearer CRON_SECRET" https://tu-dominio.com/api/cron/payments
```

Local:

```bash
curl -H "Authorization: Bearer CRON_SECRET" http://localhost:3000/api/cron/payments
```

Reemplaza `CRON_SECRET` por el valor real configurado.

## Variables de entorno

- `CRON_SECRET`: token privado para autorizar el cron.
- `TZ`: recomendable `America/Bogota` para evitar desfases de fecha.
