# Manual de Convivencia (MC-001): publicación y aceptación

Documento de negocio. Explica **qué es**, **para qué existe**, **qué reglas impone el sistema**, **qué pasos se esperan de cada rol** y **qué falta**.

---

## 1. Qué es y para qué sirve

El *Manual de Convivencia y Uso de Inmuebles Administrados* (código **MC-001**) es el reglamento interno que fija cómo se usan las unidades y las áreas comunes: ruido, mascotas, obras, visitantes, seguridad, mantenimiento, PQRS y régimen disciplinario.

Antes de esta funcionalidad el manual era solo un PDF. Eso tiene un problema de negocio: **no había evidencia de que el inquilino lo hubiera leído**, y sin esa evidencia las medidas correctivas o sanciones tienen poca base.

La funcionalidad resuelve dos cosas:

| Parte | Qué hace |
|---|---|
| **Publicar** | El manual completo se lee dentro de la app, siempre en su versión vigente. |
| **Aceptar** | Cada usuario confirma que lo leyó. El sistema guarda quién, cuándo, qué versión, y desde qué IP/navegador. |

Y una tercera, que es la regla de negocio importante:

| Parte | Qué hace |
|---|---|
| **Bloquear** | Una solicitud de arriendo **no se puede aprobar** si el inquilino no ha aceptado la versión vigente del manual. |

---

## 2. Reglas de negocio

1. **Una aceptación es por usuario + versión.** Aceptar la versión 1.0 no vale para la 1.1.
2. **Subir la versión obliga a aceptar de nuevo.** Cambiar `MANUAL_VERSION` en `src/lib/manual.ts` deja a todos como "pendientes".
3. **La aceptación no se borra.** Es trazabilidad legal. Si el usuario se elimina, sus aceptaciones se eliminan con él (cascada).
4. **Aceptar es idempotente.** Si el usuario ya aceptó, se conserva la fecha original.
5. **Solo cuenta si hay sesión.** Un visitante sin cuenta puede leer el manual pero no aceptarlo.
6. **El servidor es quien bloquea**, no la interfaz. La regla vive en `hasAcceptedManual()` (`src/lib/manualAcceptance.ts`) y se aplica dentro de `setProcessDecisionAction`.
7. **El bloqueo no es silencioso.** Al intentar aprobar sin manual aceptado, el inquilino recibe una notificación `REMINDER` con enlace a `/manual`, y el admin ve el motivo.
8. **Rechazar no exige el manual.** El bloqueo aplica solo a **aprobar**.

---

## 3. Pasos esperados, por rol

### Inquilino

1. Recibe el correo de invitación y se registra con el token.
2. Completa el wizard de aplicación (perfil, datos, documentos, garantía).
3. **Lee y acepta el manual** en `/manual` (checkbox + botón "Aceptar manual").
   - Puede hacerlo en cualquier momento: no hay que esperar a que el admin lo pida.
   - En su dashboard ve la tarjeta *Manual de convivencia* con un `!` mientras esté pendiente.
   - En *Mis procesos* ve un aviso amarillo mientras esté pendiente.
4. Espera la decisión del admin.

### Administrador

1. Revisa la solicitud en `/dashboard/admin/applications/[id]` (documentos, datos, garantía).
2. Pulsa **Aprobar** (con condiciones opcionales) o **Rechazar** (con motivo).
3. Si el inquilino no aceptó el manual, la aprobación se rechaza con el mensaje:
   *"El inquilino aún no ha aceptado el Manual de Convivencia. Se le envió un recordatorio; podrás aprobar cuando lo acepte."*
4. Cuando el inquilino acepte, vuelve a pulsar **Aprobar**.
5. En `/dashboard/admin/manual` puede ver quién aceptó la versión vigente y quién está pendiente.

### Quien mantiene el manual (responsable documental)

1. Edita el contenido fuente (ver §6).
2. Sube `MANUAL_VERSION` (ej. `1.0` → `1.1`) y deja constancia en el control de versiones del propio manual.
3. Comunica el cambio a propietarios y arrendatarios (el manual lo exige en su sección *Control de cambios*).

---

## 4. Flujo resumido

```
Inquilino se registra ──► completa wizard ──► (en cualquier momento) lee y ACEPTA el manual
                                   │
                                   ▼
                          Admin revisa la solicitud
                                   │
                           pulsa APROBAR
                                   │
                ┌──────────────────┴──────────────────┐
        ¿aceptó el manual v. vigente?                  │
             SÍ                                        NO
              │                                        │
     Proceso → APPROVED                  Se rechaza la acción + recordatorio al inquilino
```

---

## 5. Qué NO hace todavía (alcance real)

| Pendiente | Detalle |
|---|---|
| **Bloqueo en la firma/activación del contrato** | En el código actual ninguna pantalla pasa un contrato a `ACTIVE` (solo lo hacen los seeds). El bloqueo está en la **aprobación**, que es el último paso real. Cuando exista la firma, debe reutilizar `hasAcceptedManual()`. Ver `flows.md` §2. |
| **Aceptación en el registro con token** | El checkbox `agreeTerms` del registro acepta los *términos generales*, no el manual. Registrarlo ahí sin mostrarlo sería débil legalmente. |
| **Migración a producción** | La tabla `manual_acceptances` solo se aplicó a la base local (sqlite). Falta `pnpm db:push:prod`. |
| **Régimen disciplinario** | El manual lo define (Tomo IX) pero la app no tiene casos disciplinarios, descargos ni recursos todavía. |
| **PQRS, autorizaciones y registros** | Tomos V, VIII y X: solo publicados como texto; sin módulo. |
| **Manual distinto por propiedad** | Hoy hay un único manual para todas las propiedades. |

---

## 6. Dónde vive cada cosa (para quien mantiene el sistema)

| Qué | Dónde |
|---|---|
| Contenido del manual (texto) | `src/content/manual/manual.json` (generado desde el PDF) |
| Código y versión vigente | `src/lib/manual.ts` (`MANUAL_CODE`, `MANUAL_VERSION`) |
| Regla "¿aceptó?" | `src/lib/manualAcceptance.ts` → `hasAcceptedManual(userId)` |
| Server actions | `src/actions/manual/index.ts` |
| Bloqueo de aprobación | `src/actions/application-review/index.ts` → `setProcessDecisionAction` |
| Página pública + aceptación | `/manual` (`src/app/manual/`) |
| Reporte admin | `/dashboard/admin/manual` |
| Modelo | `ManualAcceptance` (tabla `manual_acceptances`), único por `userId + manualCode + manualVersion` |

**Actualizar el contenido:** el JSON se generó convirtiendo el PDF. Si cambia el PDF, hay que regenerarlo y subir `MANUAL_VERSION`.

---

## 7. Problemas detectados en el PDF fuente (para corregir antes de oficializar)

- Quedan marcas de borrador: "Mensaje 2", "Mensaje 8", "Mensaje 10", "Mensaje 12", "Mensaje 14", "Mensaje 16", "Mensaje 18". La app las omite al publicar.
- Hay un bloque de borrador "Más de 200 definiciones: … etc." que se omitió; el glosario real sí se publica.
- **El Tomo II (Derechos y Obligaciones) está vacío.** La app no muestra tomos sin contenido.
- La numeración de títulos salta del XIV al XVI; los artículos reinician en cada título.
- Las categorías de faltas dicen "aproximadamente 100/60/50/30 conductas" pero solo listan ejemplos. Para sancionar hace falta el catálogo cerrado (el propio manual lo menciona como *Anexo de Tipificación de Faltas*, con más de 250 ejemplos, aún no elaborado).
- La referencia a la Ley 675 (propiedad horizontal) es solo técnica. Para arrendamiento aplica la Ley 820 de 2003. Se recomienda revisión jurídica de las secciones de sanciones y terminación contractual.
- Campos de aprobación y firmas (portada y control documental) están en blanco.

---

## 8. Cómo probarlo con datos de demostración

El seed `prisma/seed/first-cases/seed-procesos-demo.ts` crea 6 procesos en *Casa Ferias*, uno por situación. Contraseña de todos: `SEED_PASSWORD`.

| Inquilino | Estado del proceso | Manual | Qué se prueba |
|---|---|---|---|
| `v.ospinarey@tenant-properties.com` | `IN_PROGRESS` (paso 2) | No | Reanudar el wizard a medias |
| `m.castanobernal@tenant-properties.com` | `IN_EVALUATION`, todo revisado OK | **No aceptado** | Aprobar debe **bloquearse** y mandar recordatorio |
| `i.montoyasalazar@tenant-properties.com` | `IN_EVALUATION`, todo revisado OK | **Aceptado** | Aprobar debe **funcionar** |
| `s.herreraduque@tenant-properties.com` | `WAITING_FOR_FEEDBACK` | No | 2 documentos con observaciones del admin |
| `c.restrepogil@tenant-properties.com` | `DISAPPROVED` | No | Ver motivo de rechazo |
| `d.velezarango@tenant-properties.com` | `APPROVED`, contrato en `APPROVED` | Aceptado | Punto de partida del flujo de contrato |

**Prueba mínima de la regla:**

1. Entra como admin y abre la solicitud de Mateo → *Aprobar* → debe rechazarse con el mensaje del manual.
2. Entra como Mateo, abre `/manual`, acepta.
3. Vuelve como admin → *Aprobar* → debe pasar a `APPROVED`.
4. Entra como admin → *Manual de convivencia* → Mateo aparece como aceptado.

**Correr solo este seed:**

```bash
npx tsx prisma/seed/first-cases/seed-procesos-demo.ts
```

El seed es idempotente (no duplica si ya existe el par inquilino + unidad). Los documentos son registros de demo: sus rutas (`/uploads/demo/...`) no existen en disco.

---

## 9. Decisiones pendientes de negocio

1. ¿La firma del contrato será en papel (el admin marca "firmado") o digital?
2. ¿La aceptación del manual también será requisito para entrar al dashboard, o solo para aprobar/activar?
3. ¿Las multas están en los contratos de arrendamiento, o solo la reparación de daños? Define si el régimen disciplinario lleva montos.
4. ¿Cada propiedad puede tener su propio manual (horarios, mascotas) o es uno solo?
