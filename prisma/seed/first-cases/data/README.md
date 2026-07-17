# Datos de propiedades → seed

Cada propiedad real se describe en un archivo de texto `<slug>.md` (fuente de verdad).
De ahí se **genera** el `seed-casa-<slug>.ts` con el script — no se edita el `.ts` a mano.

## Cómo llenar una propiedad nueva
1. Copia [`_PLANTILLA.md`](./_PLANTILLA.md) como `<slug>.md` (ej. `gaitana.md`).
2. Llénalo. Convenciones: `*`=requerido · `(est)`=estimado · `???`=falta ·
   `[CONSULTAR]`=hay que hablarlo con el dueño (se recopila en el bloque final).
3. Genera y revisa (ver abajo).

## Generar y comparar (sin abrir Prisma Studio)
```bash
# Preview: crea seed-casa-<slug>.generated.ts — NO pisa el seed real.
npm run seed:gen -- <slug>

# Adoptar: sobrescribe el seed-casa-<slug>.ts real.
npm run seed:gen -- <slug> --write
```
El `.generated.ts` es un `.ts` legible con **toda** la info de la propiedad y sus
unidades ya mapeada al modelo: sirve para **planear**, para ver cómo quedan los campos
(shared*, commonZones, áreas…) y para **comparar** contra el seed actual antes de pisarlo,
sin tener que ir al Studio.

## Notas
- id de propiedad = `case-casa-<slug>` (estable; owners/rentals/modules lo referencian).
- admin por defecto: `admin1@propiedades.com`.
- Zonas comunes → `zonas_comunes:` (campo `commonZones`); una habitación de piso
  compartido usa `comparte:` (flags `shared*`). Ver la leyenda en `_PLANTILLA.md`.
- Tras adoptar (`--write`), corre el seed completo + regresión:
  `npm run db:seed` y `npx tsx scripts/check-phases.ts`.
